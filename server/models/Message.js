import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      default: "Mrs. Aravinth",
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    emoji: {
      type: String,
      default: "💖",
    },
    hearts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
