import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ProfileSchema = new Schema(
  {
    // Singleton: always fetched with findOne().
    name: { type: String, required: true },
    title: { type: String, required: true },
    headline: { type: String, required: true },
    subHeadline: { type: String, required: true },
    rotatingRoles: { type: [String], default: [] },
    statusText: { type: String, default: "" },
    openToWork: { type: Boolean, default: true },
    location: { type: String, default: "" },
    workPreference: { type: String, default: "" },
    aboutHtml: { type: String, default: "" },
    photoFileId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    showPhone: { type: Boolean, default: false },
    softSkills: { type: [String], default: [] },
    // Recruiter Mode summary.
    topSkills: { type: [String], default: [] },
    keyAchievements: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type ProfileDoc = InferSchemaType<typeof ProfileSchema>;
export const Profile: Model<ProfileDoc> = models.Profile || model<ProfileDoc>("Profile", ProfileSchema);
