import mongoose from "mongoose";

/** Clears rate-limit buckets so login tests start from a clean slate. Messages are never touched. */
export default async function globalSetup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.collection("ratelimits").deleteMany({});
  await mongoose.disconnect();
}
