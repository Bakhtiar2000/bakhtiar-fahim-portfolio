"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { Message } from "@/lib/models";
import { hitRateLimit } from "@/lib/rate-limit";
import { clientIp, findOperatorKey } from "@/lib/security";
import { contactSchema, type ContactInput } from "@/lib/validators";

export interface ContactState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof ContactInput, string>>;
}

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

export async function submitContact(_prev: ContactState, input: unknown): Promise<ContactState> {
  if (!input || typeof input !== "object" || findOperatorKey(input)) {
    return { status: "error", message: "Invalid submission." };
  }

  // Honeypot: real visitors never see or fill this field. Pretend success.
  const honeypot = (input as Record<string, unknown>).website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", message: "Thanks! Your message is on its way." };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactInput;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    const ip = clientIp(await headers());
    const limit = await hitRateLimit("contact", ip, CONTACT_LIMIT, CONTACT_WINDOW_MS);
    if (!limit.allowed) {
      return {
        status: "error",
        message: "You've sent a few messages already. Please try again in an hour, or email me directly.",
      };
    }

    await connectDB();
    const data = parsed.data;
    await Message.create({
      name: data.name,
      email: data.email,
      company: data.company,
      subject: data.subject,
      body: data.message,
    });

    // Email notification is optional and never blocks the visitor's response.
    after(() => notifyByEmail(data));

    return { status: "success", message: "Thanks! I'll get back to you soon." };
  } catch (error) {
    console.error("[contact] submit failed:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Something went wrong on my side. Please email me directly instead." };
  }
}

async function notifyByEmail(data: ContactInput) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env();
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) return;
  const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: data.email,
        subject: `Portfolio: ${data.subject}`,
        html: `<p><strong>${escape(data.name)}</strong> &lt;${escape(data.email)}&gt;${data.company ? ` · ${escape(data.company)}` : ""}</p><p style="white-space:pre-wrap">${escape(data.message)}</p>`,
        text: `${data.name} <${data.email}>${data.company ? ` · ${data.company}` : ""}\n\n${data.message}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[contact] Resend responded", res.status, await res.text().catch(() => ""));
  } catch (error) {
    console.error("[contact] Resend failed:", error instanceof Error ? error.message : error);
  }
}
