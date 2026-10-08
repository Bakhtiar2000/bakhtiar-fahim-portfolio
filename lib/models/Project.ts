import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const FeatureGroupSchema = new Schema(
  {
    audience: { type: String, required: true },
    items: { type: [String], default: [] },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    pitch: { type: String, required: true },
    descriptionHtml: { type: String, default: "" },
    role: { type: String, default: "" },
    category: { type: String, default: "" },
    features: { type: [FeatureGroupSchema], default: [] },
    challenges: { type: [String], default: [] },
    tech: { type: [String], default: [] },
    liveUrl: { type: String, default: "" },
    clientRepo: { type: String, default: "" },
    serverRepo: { type: String, default: "" },
    coverFileId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    galleryFileIds: { type: [Schema.Types.ObjectId], ref: "File", default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export const Project: Model<ProjectDoc> = models.Project || model<ProjectDoc>("Project", ProjectSchema);
