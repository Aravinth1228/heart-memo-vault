import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, isMongoConnected } from "./db.js";
import {
  getAllMessages,
  createMessage,
  likeMessage,
  deleteMessage,
} from "./services/messageService.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Root endpoint (for deployment verification on Render / Railway)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Mrs. Aravinth Love Vault Backend",
    database: isMongoConnected ? "MongoDB Atlas (Connected)" : "MongoDB (Active)",
    endpoints: {
      health: "/api/health",
      messages: "/api/messages",
    },
    time: new Date().toISOString(),
  });
});

// Health & Status endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    backend: "Node.js (Express)",
    database: isMongoConnected ? "MongoDB (Connected)" : "MongoDB (Connecting / Active)",
    timestamp: new Date().toISOString(),
  });
});

// GET all messages (latest first)
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json({ ok: true, messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    res.status(500).json({ ok: false, error: "Could not fetch messages" });
  }
});

// POST a new message
app.post("/api/messages", async (req, res) => {
  try {
    const { sender, content, emoji } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ ok: false, error: "Message content cannot be empty" });
    }
    const message = await createMessage({ sender, content, emoji });
    res.status(201).json({ ok: true, message });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    res.status(500).json({ ok: false, error: "Could not save message" });
  }
});

// POST like/heart a message
app.post("/api/messages/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await likeMessage(id);
    if (!updated) {
      return res.status(404).json({ ok: false, error: "Message not found" });
    }
    res.json({ ok: true, message: updated });
  } catch (error) {
    console.error("POST /api/messages/:id/like error:", error);
    res.status(500).json({ ok: false, error: "Could not like message" });
  }
});

// DELETE a message
app.delete("/api/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteMessage(id);
    res.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/messages/:id error:", error);
    res.status(500).json({ ok: false, error: "Could not delete message" });
  }
});

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Node.js Backend Server running on http://localhost:${PORT}`);
  });
});
