import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ArchitectureNodeSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    sublabel: { type: String, default: "" },
    // Groups nodes in the stacked mobile view.
    layer: { type: String, default: "" },
    description: { type: String, default: "" },
    contribution: { type: String, default: "" },
    // Position in a 0-100 coordinate space (desktop diagram).
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    connections: { type: [String], default: [] },
  },
  { _id: false },
);

const CaseStudySchema = new Schema(
  {
    // Singleton.
    eyebrow: { type: String, default: "" },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    product: { type: String, default: "" },
    myRole: { type: String, default: "" },
    shipped: { type: String, default: "" },
    shippedChips: { type: [String], default: [] },
    architecture: { type: [ArchitectureNodeSchema], default: [] },
    mockupFileIds: { type: [Schema.Types.ObjectId], ref: "File", default: [] },
  },
  { timestamps: true },
);

export type CaseStudyDoc = InferSchemaType<typeof CaseStudySchema>;
export const CaseStudy: Model<CaseStudyDoc> = models.CaseStudy || model<CaseStudyDoc>("CaseStudy", CaseStudySchema);
