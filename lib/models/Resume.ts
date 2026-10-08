import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ResumeSchema = new Schema(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    fileName: { type: String, required: true },
    size: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type ResumeDoc = InferSchemaType<typeof ResumeSchema>;
export const Resume: Model<ResumeDoc> = models.Resume || model<ResumeDoc>("Resume", ResumeSchema);
