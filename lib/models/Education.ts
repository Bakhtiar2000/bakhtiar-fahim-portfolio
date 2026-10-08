import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null },
    cgpa: { type: String, default: "" },
    notes: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type EducationDoc = InferSchemaType<typeof EducationSchema>;
export const Education: Model<EducationDoc> = models.Education || model<EducationDoc>("Education", EducationSchema);
