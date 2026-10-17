import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MessageModel } from "../models/Message.js";
import { isMongoConnected } from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/messages.json");

function readFallback() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFallback(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing fallback messages:", err);
  }
}

export async function getAllMessages() {
  if (isMongoConnected) {
    try {
      return await MessageModel.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn("MongoDB query failed, using local store:", e.message);
    }
  }
  return readFallback().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createMessage({ sender, content, emoji }) {
  const item = {
    sender: sender && sender.trim() ? sender.trim() : "Mrs. Aravinth",
    content: content.trim(),
    emoji: emoji || "💖",
    hearts: 0,
    createdAt: new Date(),
  };

  if (isMongoConnected) {
    try {
      const doc = await MessageModel.create(item);
      return doc.toObject();
    } catch (e) {
      console.warn("MongoDB create failed, saving locally:", e.message);
    }
  }

  const list = readFallback();
  const fallbackItem = {
    ...item,
    _id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
  };
  list.unshift(fallbackItem);
  writeFallback(list);
  return fallbackItem;
}

export async function likeMessage(id) {
  if (isMongoConnected) {
    try {
      const doc = await MessageModel.findByIdAndUpdate(
        id,
        { $inc: { hearts: 1 } },
        { new: true }
      ).lean();
      if (doc) return doc;
    } catch (e) {
      console.warn("MongoDB like failed, using local store:", e.message);
    }
  }

  const list = readFallback();
  const item = list.find((m) => String(m._id) === String(id));
  if (item) {
    item.hearts = (item.hearts || 0) + 1;
    writeFallback(list);
    return item;
  }
  return null;
}

export async function deleteMessage(id) {
  if (isMongoConnected) {
    try {
      await MessageModel.findByIdAndDelete(id);
      return true;
    } catch (e) {
      console.warn("MongoDB delete failed, using local store:", e.message);
    }
  }

  let list = readFallback();
  list = list.filter((m) => String(m._id) !== String(id));
  writeFallback(list);
  return true;
}
