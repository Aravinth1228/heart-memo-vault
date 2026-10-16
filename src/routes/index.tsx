import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Heart, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unlockLoveMemories } from "@/lib/love-gate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mrs. Aravinth — Our little place" },
      {
        name: "description",
        content: "A private collection of love notes and shared photos, made just for you, Mrs. Aravinth.",
      },
      { property: "og:title", content: "Mrs. Aravinth — Our little place" },
      {
        property: "og:description",
        content: "A private collection of love notes and shared photos, made just for you, Mrs. Aravinth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoveGatePage,
});

function LoveGatePage() {
  const navigate = useNavigate();
  const unlock = useServerFn(unlockLoveMemories);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsUnlocking(true);
    try {
      const result = await unlock({ data: { password } });
      if (!result.ok) {
        setMessage("That password is not correct. Please try again.");
        return;
      }
      await navigate({ to: "/memories" });
    } catch {
      setMessage("Your memories could not be opened. Please try again in a moment.");
    } finally {
      setIsUnlocking(false);
    }
  }

  return (
    <main className="memory-page">
      <header className="memory-topbar memory-shell">
        <a className="memory-brand" href="/" aria-label="Mrs. Aravinth home">
          <span className="memory-brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span>Mrs. Aravinth</span>
        </a>
      </header>

      <section className="memory-shell memory-gate-layout" aria-labelledby="love-title">
        <div className="memory-intro">
          <div className="memory-kicker"><Sparkles size={15} /> Made only for you, with all my love</div>
          <h1 className="memory-title" id="love-title">Mrs. Aravinth</h1>
          <p className="memory-lede">
            I tucked our laughter, our talks, and all the ways I love you into this little collection
            of memories.
          </p>
          <div className="memory-divider" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
          <div className="memory-miss-moment" aria-label="Missing you, Mrs. Aravinth">
            <span className="memory-miss-toy" aria-hidden="true">
              <span className="memory-miss-bear" />
              <Heart className="memory-miss-heart" size={17} fill="currentColor" />
            </span>
            <p>I miss you a little more with every heartbeat.</p>
          </div>
        </div>

        <form className="memory-gate-card" onSubmit={handleSubmit}>
          <span className="memory-gate-lock" aria-hidden="true"><LockKeyhole size={22} /></span>
          <h2 className="memory-gate-title">Just for you</h2>
          <p className="memory-gate-copy">
            Enter our secret password to open the memories I saved for you.
          </p>
          <label className="sr-only" htmlFor="love-password">Password</label>
          <div className="memory-password-control">
            <Input
              id="love-password"
              className="memory-passcode-input"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter our password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              maxLength={256}
              required
            />
            <Button
              className="memory-password-toggle"
              type="button"
              variant="ghost"
              size="sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </Button>
          </div>
          <Button className="memory-open-button" type="submit" disabled={isUnlocking}>
            <Heart size={16} fill="currentColor" />
            {isUnlocking ? "Opening your memories…" : "Open our memories"}
          </Button>
          <p className="memory-error" role="alert">{message}</p>
          <p className="memory-gate-footnote">Always yours, Aravinth <Heart size={12} fill="currentColor" /></p>
        </form>
      </section>
    </main>
  );
}