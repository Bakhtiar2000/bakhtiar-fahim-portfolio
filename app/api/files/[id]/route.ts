import { connectDB } from "@/lib/db";
import { FileModel } from "@/lib/models";
import { isObjectId } from "@/lib/security";

/** Serves uploaded files. Ids are immutable (a new upload gets a new id), so responses cache forever. */
export async function GET(request: Request, ctx: RouteContext<"/api/files/[id]">) {
  const { id } = await ctx.params;
  if (!isObjectId(id)) return new Response("Not found", { status: 404 });

  await connectDB();
  const file = await FileModel.findById(id).select("+data");
  if (!file) return new Response("Not found", { status: 404 });

  const etag = `"${file.sha256}"`;
  const headers = new Headers({
    "Content-Type": file.contentType,
    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  });
  if (file.kind !== "pdf")
    headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");

  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });

  const download = new URL(request.url).searchParams.has("download");
  const safeName = file.filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
  headers.set("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${safeName}"`);
  headers.set("Content-Length", String(file.size));

  return new Response(new Uint8Array(file.data), { status: 200, headers });
}
