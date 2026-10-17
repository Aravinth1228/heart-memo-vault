import { useState, useEffect, type FormEvent } from "react";
import { Heart, Send, Sparkles, Trash2, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  _id: string;
  sender: string;
  content: string;
  emoji: string;
  hearts: number;
  createdAt: string;
}

// Automatically choose API host (support Vercel VITE_API_URL or local backend)
const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, "")}/api`
    : typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
      window.location.port !== "5001"
    ? `http://${window.location.hostname}:5001/api`
    : "/api";

export function MemoryChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sender, setSender] = useState<"Mrs. Aravinth" | "Aravinth">("Mrs. Aravinth");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("💖");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const quickNotes = [
    "I miss you so much da! 💕",
    "Love you forever papa! 💖",
    "Thinking of you every second 🥰",
    "You are my whole world 🌹",
    "Can't wait to see your smile! ✨",
  ];

  const emojiList = ["💖", "💕", "🥰", "🌹", "💍", "✨", "😘", "❤️"];

  // Fetch all messages
  async function loadMessages() {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch {
      // Silently retry on next poll interval
    }
  }

  useEffect(() => {
    loadMessages();
    // Poll every 3 seconds so lover's messages show up in real-time
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, content: content.trim(), emoji }),
      });

      const data = await res.json();
      if (data.ok && data.message) {
        setMessages((prev) => [data.message, ...prev]);
        setContent("");
        setSuccessMsg("Your love message was saved to database!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.error || "Could not save message");
      }
    } catch {
      setErrorMsg("Could not connect to backend server. Please verify backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLike(id: string) {
    try {
      const res = await fetch(`${API_BASE}/messages/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === id ? { ...m, hearts: data.message.hearts } : m))
          );
        }
      }
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_BASE}/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch {
      // ignore
    }
  }

  function formatTime(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "Just now";
    }
  }

  return (
    <section className="memory-chat-section" aria-labelledby="chat-title">
      <div className="memory-chat-header">
        <div className="memory-kicker">
          <MessageCircleHeart size={16} /> Live Memory Chat & Love Notes
        </div>
        <h2 className="memory-chat-title" id="chat-title">
          Leave a Love Note for Each Other
        </h2>
      </div>

      <form className="memory-chat-form" onSubmit={handleSubmit}>
        <div className="memory-chat-sender-row">
          <span className="memory-chat-label">Who is sending?</span>
          <div className="memory-chat-sender-toggles">
            <button
              type="button"
              className={`memory-sender-btn ${sender === "Mrs. Aravinth" ? "is-active" : ""}`}
              onClick={() => setSender("Mrs. Aravinth")}
            >
              👑 Mrs. Aravinth
            </button>
            <button
              type="button"
              className={`memory-sender-btn ${sender === "Aravinth" ? "is-active" : ""}`}
              onClick={() => setSender("Aravinth")}
            >
              💖 Aravinth
            </button>
          </div>
        </div>

        <div className="memory-chat-presets">
          <span className="memory-chat-presets-label">Quick love notes:</span>
          <div className="memory-chat-presets-list">
            {quickNotes.map((note) => (
              <button
                type="button"
                key={note}
                className="memory-preset-chip"
                onClick={() => setContent(note)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        <div className="memory-chat-input-wrap">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              sender === "Mrs. Aravinth"
                ? "Write a sweet message for Aravinth... 💕"
                : "Write a sweet message for Mrs. Aravinth... 💖"
            }
            className="memory-chat-textarea"
            rows={3}
            maxLength={1000}
            required
          />
        </div>

        <div className="memory-chat-controls">
          <div className="memory-chat-emojis">
            {emojiList.map((e) => (
              <button
                type="button"
                key={e}
                className={`memory-emoji-btn ${emoji === e ? "is-selected" : ""}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="memory-chat-submit-btn"
          >
            <Send size={15} />
            {isSubmitting ? "Sending..." : "Send Note"}
          </Button>
        </div>

        {successMsg && <p className="memory-chat-success">{successMsg}</p>}
        {errorMsg && <p className="memory-chat-error">{errorMsg}</p>}
      </form>

      {/* Live messages feed */}
      <div className="memory-chat-feed">
        <div className="memory-chat-feed-header">
          <span className="memory-chat-feed-title">
            <Sparkles size={16} /> Live Love Notes ({messages.length})
          </span>
          <span className="memory-chat-live-pulse" title="Auto-updating live">
            <span className="memory-pulse-dot" /> Live Connected
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="memory-chat-empty">
            <Heart size={32} className="text-rose-400 animate-pulse" />
            <p>No messages yet! Type a sweet note above to surprise Aravinth 💕</p>
          </div>
        ) : (
          <div className="memory-chat-list">
            {messages.map((msg) => {
              const isLover = msg.sender === "Mrs. Aravinth";
              return (
                <div
                  key={msg._id}
                  className={`memory-msg-card ${isLover ? "is-lover" : "is-aravinth"}`}
                >
                  <div className="memory-msg-header">
                    <div className="memory-msg-sender-wrap">
                      <span className="memory-msg-badge">
                        {isLover ? "👑 Mrs. Aravinth" : "💖 Aravinth"}
                      </span>
                      <span className="memory-msg-time">{formatTime(msg.createdAt)}</span>
                    </div>

                    <div className="memory-msg-actions">
                      <button
                        type="button"
                        onClick={() => handleLike(msg._id)}
                        className="memory-like-btn"
                        title="Send hearts"
                      >
                        <Heart size={14} className="fill-rose-500 text-rose-500" />
                        <span>{msg.hearts || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(msg._id)}
                        className="memory-del-btn"
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="memory-msg-content">
                    <span className="memory-msg-emoji">{msg.emoji || "💖"}</span>
                    {msg.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
