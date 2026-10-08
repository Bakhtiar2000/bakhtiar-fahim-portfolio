import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AchievementSchema = new Schema(
  {
    title: { type: String, required: true },
    event: { type: String, default: "" },
    date: { type: Date, default: null },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type AchievementDoc = InferSchemaType<typeof AchievementSchema>;
export const Achievement: Model<AchievementDoc> = models.Achievement || model<AchievementDoc>("Achievement", AchievementSchema);
