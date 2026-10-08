"use client";

import { track } from "@vercel/analytics";

type EventName = "resume_click" | "contact_click" | "project_link" | "contact_submit" | "recruiter_mode";

/** Thin wrapper so analytics stays optional and never throws. */
export function trackEvent(name: EventName, props?: Record<string, string>) {
  try {
    track(name, props);
  } catch {}
}
