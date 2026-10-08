import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth/session";
import { CONTENT_TAG } from "@/lib/content";
import { connectDB } from "@/lib/db";
import { FileModel, Resume } from "@/lib/models";
import { isSameOrigin, sha256 } from "@/lib/security";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PDF_BYTES = 5 * 1024 * 1024;

/** Detects the real type from magic bytes; the browser-supplied type is never trusted. */
function sniffImage(b: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...b.subarray(start, end));
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12))) return "image/avif";
  return null;
}

const isPdf = (b: Uint8Array) => String.fromCharCode(...b.subarray(0, 5)) === "%PDF-";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  // proxy.ts already checked the cookie; verify again here (never rely on the proxy alone).
  if (!(await isAdmin())) return json({ error: "Unauthorized" }, 401);
  if (!isSameOrigin(request)) return json({ error: "Cross-origin request rejected" }, 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart/form-data" }, 400);
  }
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File)) return json({ error: "No file uploaded" }, 400);
  if (kind !== "image" && kind !== "resume") return json({ error: "Invalid upload kind" }, 400);

  const max = kind === "resume" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size === 0) return json({ error: "The file is empty" }, 400);
  if (file.size > max) return json({ error: `File is too large (max ${max / 1024 / 1024} MB)` }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  let contentType: string | null;
  if (kind === "resume") {
    contentType = isPdf(bytes) ? "application/pdf" : null;
    if (!contentType) return json({ error: "Only PDF files are allowed" }, 415);
  } else {
    contentType = sniffImage(bytes);
    if (!contentType) return json({ error: "Only PNG, JPEG, WebP, GIF or AVIF images are allowed" }, 415);
  }

  const filename = (file.name || (kind === "resume" ? "resume.pdf" : "image")).replace(/[^\w.\- ]+/g, "_").slice(0, 120);

  await connectDB();
  const doc = await FileModel.create({
    filename,
    contentType,
    size: bytes.byteLength,
    sha256: sha256(bytes),
    kind: kind === "resume" ? "pdf" : "image",
    data: Buffer.from(bytes),
  });

  if (kind === "resume") {
    // A new upload becomes the active resume immediately; older versions stay in history.
    await Resume.updateMany({}, { $set: { isActive: false } });
    const resume = await Resume.create({ fileId: doc._id, fileName: filename, size: bytes.byteLength, isActive: true });
    revalidateTag(CONTENT_TAG, { expire: 0 });
    return json({ id: String(doc._id), resumeId: String(resume._id) }, 201);
  }

  return json({ id: String(doc._id) }, 201);
}
