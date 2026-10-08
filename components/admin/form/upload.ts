"use client";

/** Uploads a file to /api/admin/upload and returns the stored file id. */
export async function uploadFile(file: File, kind: "image" | "resume"): Promise<{ id: string }> {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) throw new Error(data.error ?? `Upload failed (${res.status})`);
  return { id: data.id };
}
