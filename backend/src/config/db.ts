import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));

  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
