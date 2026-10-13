import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Heart, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { unlockLoveMemories } from "@/lib/love-gate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aravinthlove — A little place for our memories" },
      {
        name: "description",
        content: "A private collection of love notes and shared memories, made just for you.",
      },
      { property: "og:title", content: "Aravinthlove — Our little place" },
      {
        property: "og:description",
        content: "A private collection of love notes and shared memories, made just for you.",
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
  const [message, setMessage] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsUnlocking(true);
    try {
      const result = await unlock({ data: { password } });
      if (!result.ok) {
        setMessage("Indha password sari illa. Marubadi try pannunga.");
        return;
      }
      await navigate({ to: "/memories" });
    } catch {
      setMessage("Ippo memories-a open panna mudiyala. Konjam nerathula try pannunga.");
    } finally {
      setIsUnlocking(false);
    }
  }

  return (
    <main className="memory-page">
      <header className="memory-topbar memory-shell">
        <a className="memory-brand" href="/" aria-label="Aravinthlove home">
          <span className="memory-brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span>Aravinthlove</span>
        </a>
      </header>

      <section className="memory-shell memory-gate-layout" aria-labelledby="love-title">
        <div className="memory-intro">
          <div className="memory-kicker"><Sparkles size={15} /> Unakku mattum, en anbudan</div>
          <h1 className="memory-title" id="love-title">Aravinthlove</h1>
          <p className="memory-lede">
            Namma sirippu, namma pechu, unna evlo love panren — ellame inga chinna chinna
            ninaivugalaa vechirukken.
          </p>
          <div className="memory-divider" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
        </div>

        <form className="memory-gate-card" onSubmit={handleSubmit}>
          <span className="memory-gate-lock" aria-hidden="true"><LockKeyhole size={22} /></span>
          <h2 className="memory-gate-title">Unakkaga mattum</h2>
          <p className="memory-gate-copy">
            Namma special memories-a paakka, namma secret password enter pannu.
          </p>
          <label className="sr-only" htmlFor="love-password">Password</label>
          <Input
            id="love-password"
            className="memory-passcode-input"
            type="password"
            autoComplete="current-password"
            placeholder="Password enter pannunga"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            maxLength={256}
            required
          />
          <Button className="memory-open-button" type="submit" disabled={isUnlocking}>
            <Heart size={16} fill="currentColor" />
            {isUnlocking ? "Open aagudhu…" : "Namma memories-a paaru"}
          </Button>
          <p className="memory-error" role="alert">{message}</p>
          <p className="memory-gate-footnote">Eppavume un Aravinth <Heart size={12} fill="currentColor" /></p>
        </form>
      </section>
    </main>
  );
}