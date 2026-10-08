import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Uploaded binary (images, resume PDFs). Stored inline; uploads are capped well below 16MB. */
const FileSchema = new Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    sha256: { type: String, required: true, index: true },
    kind: { type: String, enum: ["image", "pdf"], required: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true },
);

export type FileDoc = InferSchemaType<typeof FileSchema>;
export const FileModel: Model<FileDoc> = models.File || model<FileDoc>("File", FileSchema);
