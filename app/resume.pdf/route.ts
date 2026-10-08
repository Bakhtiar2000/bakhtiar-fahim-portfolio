import { connection } from "next/server";
import { getSiteContent } from "@/lib/content";

/** Stable, shareable link that always points at the active resume. */
export async function GET(request: Request) {
  await connection();
  const { activeResumeFileId } = await getSiteContent();
  if (!activeResumeFileId) return new Response("No resume uploaded yet", { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: new URL(`/api/files/${activeResumeFileId}`, request.url).toString(), "Cache-Control": "no-store" },
  });
}
