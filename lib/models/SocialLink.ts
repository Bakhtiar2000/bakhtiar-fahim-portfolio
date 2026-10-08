import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SocialLinkSchema = new Schema(
  {
    // github | linkedin | codechef | codeforces | email | x | website ...
    platform: { type: String, required: true },
    label: { type: String, default: "" },
    url: { type: String, required: true },
    showInHero: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SocialLinkDoc = InferSchemaType<typeof SocialLinkSchema>;
export const SocialLink: Model<SocialLinkDoc> = models.SocialLink || model<SocialLinkDoc>("SocialLink", SocialLinkSchema);
