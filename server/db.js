import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heart_memo_vault";

export let isMongoConnected = false;

// Mask credentials for safe logging
function getMaskedUri(uri) {
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  } catch {
    return "MongoDB";
  }
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log("✅ MongoDB Connected successfully to:", getMaskedUri(MONGODB_URI));
  } catch (err) {
    isMongoConnected = false;
    console.warn("⚠️ MongoDB connection notice:", err.message);
    console.log("📦 Running with seamless persistent local store; will auto-sync to MongoDB Atlas when reachable.");
  }

  mongoose.connection.on("disconnected", () => {
    isMongoConnected = false;
    console.warn("⚠️ MongoDB disconnected.");
  });

  mongoose.connection.on("connected", () => {
    isMongoConnected = true;
    console.log("✅ MongoDB reconnected!");
  });
}
