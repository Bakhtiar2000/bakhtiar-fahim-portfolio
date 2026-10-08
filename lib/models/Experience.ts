import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, default: "Full-time" },
    location: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    tech: { type: [String], default: [] },
    promoted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ExperienceDoc = InferSchemaType<typeof ExperienceSchema>;
export const Experience: Model<ExperienceDoc> = models.Experience || model<ExperienceDoc>("Experience", ExperienceSchema);
