import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // MongoDB's TTL monitor deletes the document once this time passes.
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export type RateLimitDoc = InferSchemaType<typeof RateLimitSchema>;
export const RateLimit: Model<RateLimitDoc> = models.RateLimit || model<RateLimitDoc>("RateLimit", RateLimitSchema);
