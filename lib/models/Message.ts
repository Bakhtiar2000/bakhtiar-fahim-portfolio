import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const MessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "" },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type MessageDoc = InferSchemaType<typeof MessageSchema>;
export const Message: Model<MessageDoc> = models.Message || model<MessageDoc>("Message", MessageSchema);
