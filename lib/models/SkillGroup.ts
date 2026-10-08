import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    // simple-icons slug, e.g. "react" or "dotnet". Empty = monogram tile.
    icon: { type: String, default: "" },
    level: { type: String, enum: ["Daily", "Production", "Familiar"], default: "Production" },
    // Extra names used to match experience/project tech tags ("React.js" -> "React").
    aliases: { type: [String], default: [] },
  },
  { _id: false },
);

const SkillGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    skills: { type: [SkillSchema], default: [] },
  },
  { timestamps: true },
);

export type SkillGroupDoc = InferSchemaType<typeof SkillGroupSchema>;
export const SkillGroup: Model<SkillGroupDoc> = models.SkillGroup || model<SkillGroupDoc>("SkillGroup", SkillGroupSchema);
