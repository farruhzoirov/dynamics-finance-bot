import mongoose from "mongoose";
import { configEnv } from "../config/config-env";

export const connectToDatabase = async () => {
  const mongodbUri = configEnv.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  await mongoose.connect(mongodbUri, {
    connectTimeoutMS: 5000, // 5 seconds
  });
  try {
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
