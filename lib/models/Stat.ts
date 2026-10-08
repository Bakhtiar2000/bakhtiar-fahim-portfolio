import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const StatSchema = new Schema(
  {
    label: { type: String, required: true },
    // Numeric values count up; anything else ("Enterprise") renders as text.
    value: { type: String, required: true },
    prefix: { type: String, default: "" },
    suffix: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type StatDoc = InferSchemaType<typeof StatSchema>;
export const Stat: Model<StatDoc> = models.Stat || model<StatDoc>("Stat", StatSchema);
