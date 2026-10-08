import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { SECTION_KEYS } from "../sections";

const SectionSchema = new Schema(
  {
    key: { type: String, enum: SECTION_KEYS, required: true },
    visible: { type: Boolean, default: true },
    // Small "keep scrolling" line shown at the end of the section.
    teaser: { type: String, default: "" },
  },
  { _id: false },
);

const SiteSettingsSchema = new Schema(
  {
    // Singleton.
    sections: { type: [SectionSchema], default: [] },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImageFileId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    footerNote: { type: String, default: "" },
    codeforcesHandle: { type: String, default: "" },
    codeforcesFallback: {
      rating: { type: Number, default: null },
      maxRating: { type: Number, default: null },
      rank: { type: String, default: "" },
      maxRank: { type: String, default: "" },
      solved: { type: Number, default: null },
    },
    codechefHandle: { type: String, default: "" },
    codechefData: {
      rating: { type: Number, default: null },
      highestRating: { type: Number, default: null },
      stars: { type: Number, default: null },
      solved: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings || model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
