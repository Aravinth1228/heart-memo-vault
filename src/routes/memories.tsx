import { useState, type FormEvent } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Heart, KeyRound, LockKeyhole, Mail, Sparkles, Unlock } from "lucide-react";

import loveBackdrop from "@/assets/love-memory-backdrop.jpg";
import origMemory01 from "@/assets/original-memories/memory-01.webp";
import origMemory02 from "@/assets/original-memories/memory-02.png";
import origMemory03 from "@/assets/original-memories/memory-03.webp";
import origMemory04 from "@/assets/original-memories/memory-04.png";
import origMemory05 from "@/assets/original-memories/memory-05.webp";
import origMemory06 from "@/assets/original-memories/memory-06.webp";
import origMemory07 from "@/assets/original-memories/memory-07.webp";
import origMemory08 from "@/assets/original-memories/memory-08.webp";
import origMemory09 from "@/assets/original-memories/memory-09.webp";
import photo01 from "@/assets/memories/photo-01.jpg";
import photo02 from "@/assets/memories/photo-02.png";
import photo03 from "@/assets/memories/photo-03.png";
import photo04 from "@/assets/memories/photo-04.jpg";
import photo05 from "@/assets/memories/photo-05.jpg";
import photo06 from "@/assets/memories/photo-06.jpg";
import photo07 from "@/assets/memories/photo-07.jpg";
import photo08 from "@/assets/memories/photo-08.jpg";
import photo09 from "@/assets/memories/photo-09.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getLoveMemories,
  lockLoveMemories,
} from "@/lib/love-gate.functions";
import { MemoryChat } from "@/components/MemoryChat";

export const Route = createFileRoute("/memories")({
  loader: () => getLoveMemories(),
  head: () => ({
    meta: [
      { title: "Our Memories — Mrs. Aravinth" },
      {
        name: "description",
        content: "A private collection of shared photos and heartfelt love notes, made just for you, Mrs. Aravinth.",
      },
      { property: "og:title", content: "Our Memories — Mrs. Aravinth" },
      {
        property: "og:description",
        content: "A private collection of shared photos and heartfelt love notes, made just for you, Mrs. Aravinth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoriesPage,
});

const BUNDLED_MEMORY_PHOTOS = [
  origMemory01,
  origMemory02,
  origMemory03,
  origMemory04,
  origMemory05,
  origMemory06,
  origMemory07,
  origMemory08,
  origMemory09,
  photo01,
  photo02,
  photo03,
  photo04,
  photo05,
  photo06,
  photo07,
  photo08,
  photo09,
];

const SECRET_PHOTO_PIN = "1216";

function MemoriesPage() {
  const memories = Route.useLoaderData();
  const navigate = useNavigate();
  const lockMemories = useServerFn(lockLoveMemories);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openCards, setOpenCards] = useState<Set<number>>(() => new Set());

  // Photo PIN 1216 states
  const [unlockedPhotos, setUnlockedPhotos] = useState<Set<number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("aravinth_unlocked_photos");
        if (saved === "ALL") return new Set(Array.from({ length: 50 }, (_, i) => i));
        if (saved) return new Set(JSON.parse(saved));
      } catch {}
    }
    return new Set();
  });
  const [isAllUnlocked, setIsAllUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("aravinth_unlocked_photos") === "ALL";
    }
    return false;
  });
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [targetCardIndex, setTargetCardIndex] = useState<number | null>(null);
  const [pinAction, setPinAction] = useState<"flip" | "dialog">("flip");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  function isPhotoUnlocked(index: number) {
    return isAllUnlocked || unlockedPhotos.has(index);
  }

  async function handleLock() {
    await lockMemories();
    await navigate({ to: "/" });
  }

  function toggleCard(index: number) {
    setOpenCards((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleCardClick(index: number) {
    if (openCards.has(index)) {
      toggleCard(index);
      return;
    }
    if (isPhotoUnlocked(index)) {
      toggleCard(index);
    } else {
      setTargetCardIndex(index);
      setPinAction("flip");
      setPinInput("");
      setPinError("");
      setIsShaking(false);
      setPinSuccess(false);
      setPinModalOpen(true);
    }
  }

  function handleReadNoteClick(index: number) {
    if (isPhotoUnlocked(index)) {
      setSelectedIndex(index);
    } else {
      setTargetCardIndex(index);
      setPinAction("dialog");
      setPinInput("");
      setPinError("");
      setIsShaking(false);
      setPinSuccess(false);
      setPinModalOpen(true);
    }
  }

  function handlePinSubmit(e: FormEvent) {
    e.preventDefault();
    if (pinInput.trim() === SECRET_PHOTO_PIN) {
      setPinSuccess(true);
      setPinError("");
      setTimeout(() => {
        if (targetCardIndex !== null) {
          setUnlockedPhotos((prev) => {
            const next = new Set(prev);
            next.add(targetCardIndex);
            try { sessionStorage.setItem("aravinth_unlocked_photos", JSON.stringify([...next])); } catch {}
            return next;
          });
          if (pinAction === "flip") {
            toggleCard(targetCardIndex);
          } else {
            setSelectedIndex(targetCardIndex);
          }
        }
        setPinModalOpen(false);
        setPinSuccess(false);
        setPinInput("");
      }, 400);
    } else {
      setPinError("Incorrect PIN! Try again ❤️");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }

  function handleUnlockAll() {
    if (pinInput.trim() === SECRET_PHOTO_PIN) {
      setPinSuccess(true);
      setPinError("");
      setTimeout(() => {
        setIsAllUnlocked(true);
        const all = new Set(Array.from({ length: memories.length }, (_, i) => i));
        setUnlockedPhotos(all);
        try { sessionStorage.setItem("aravinth_unlocked_photos", "ALL"); } catch {}
        if (targetCardIndex !== null) {
          if (pinAction === "flip") toggleCard(targetCardIndex);
          else setSelectedIndex(targetCardIndex);
        }
        setPinModalOpen(false);
        setPinSuccess(false);
        setPinInput("");
      }, 400);
    } else {
      setPinError("Enter secret PIN first to unlock all memories! 💕");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }

  function handleLockPhotos() {
    setUnlockedPhotos(new Set());
    setIsAllUnlocked(false);
    setOpenCards(new Set());
    try { sessionStorage.removeItem("aravinth_unlocked_photos"); } catch {}
  }

  const selectedMemory = selectedIndex === null ? null : memories[selectedIndex];
  const targetMemory = targetCardIndex === null ? null : memories[targetCardIndex];
  const hasAnyUnlocked = isAllUnlocked || unlockedPhotos.size > 0;

  return (
    <main
      className="memory-page"
      style={{ "--memory-wallpaper": `url("${loveBackdrop}")` } as React.CSSProperties}
    >
      <div className="memory-floaters" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={i % 3 === 0 ? "memory-sparkle" : "memory-floater"} style={{ "--i": i } as React.CSSProperties}>
            {i % 3 === 0 ? "✦" : "♥"}
          </span>
        ))}
      </div>
      <header className="memory-topbar memory-shell">
        <a className="memory-brand" href="/memories" aria-label="Mrs. Aravinth memories">
          <span>Mrs. Aravinth</span>
        </a>
        <div className="flex items-center gap-2">
          {hasAnyUnlocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLockPhotos}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              title="Lock photos again"
            >
              <LockKeyhole size={14} className="mr-1" />
              Lock pics
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLock} aria-label="Lock memories">
            <LockKeyhole size={16} />
            Lock
          </Button>
        </div>
      </header>

      <section className="memory-shell" aria-labelledby="memory-title">
        <header className="memory-collection-header">
          <div className="memory-kicker"><Sparkles size={15} /> Just for you, with all my love</div>
          <h1 className="memory-title" id="memory-title">Our memories</h1>
          <p className="memory-lede">
            Every photo holds a little piece of us. Protected with our secret love PIN.
          </p>
          <span className="memory-count"><Heart size={14} fill="currentColor" /> {memories.length} little love notes</span>
        </header>

        <MemoryChat />

        <div className="memory-collection">
          {memories.map((memory, index) => {
            const isOpen = openCards.has(index);
            const isUnlocked = isPhotoUnlocked(index);

            return (
            <article className="memory-item" key={memory.number}>
              <button
                type="button"
                className={`memory-flip${isOpen ? " is-open" : ""}`}
                onClick={() => handleCardClick(index)}
                aria-pressed={isOpen}
                aria-label={isOpen ? `Close memory ${memory.number}: ${memory.title}` : `Tap to open memory ${memory.number}: ${memory.title}`}
              >
                <span className="memory-flip-inner">
                  <span className="memory-flip-front" aria-hidden={isOpen}>
                    <span className="memory-number">{memory.number}</span>
                    <span className="memory-envelope"><Mail size={26} /><Heart className="memory-envelope-heart" size={14} fill="currentColor" /></span>
                    <span className="memory-flip-title">{memory.title}</span>
                    {!isUnlocked ? (
                      <span className="memory-card-lock-tag"><LockKeyhole size={11} /> Locked</span>
                    ) : (
                      <span className="memory-flip-hint">Tap to open</span>
                    )}
                  </span>
                  <span className="memory-flip-back" aria-hidden={!isOpen}>
                    <span className="memory-card-photo">
                      {isOpen && BUNDLED_MEMORY_PHOTOS[index] ? (
                        <img src={BUNDLED_MEMORY_PHOTOS[index]} alt={`Memory ${memory.number}: ${memory.title}`} />
                      ) : (
                        <span className="memory-photo-placeholder"><Heart size={23} /></span>
                      )}
                    </span>
                    <span className="memory-quote">“{memory.quote}”</span>
                  </span>
                </span>
              </button>
              <div className="memory-card-copy">
                <span className="memory-card-title">{memory.title}</span>
                <span className="memory-card-teaser">{memory.teaser}</span>
              </div>
              <div className="memory-card-action">
                <Button variant="ghost" size="sm" className="memory-read-btn" onClick={() => handleReadNoteClick(index)}>
                  {!isUnlocked ? <LockKeyhole size={13} className="text-rose-500 mr-1" /> : <Heart size={14} fill="currentColor" className="mr-1" />}
                  Read note
                </Button>
              </div>
            </article>
            );
          })}
        </div>

        <footer className="memory-footer"><Heart size={13} fill="currentColor" /> Always yours, Aravinth</footer>
      </section>

      {/* Secret PIN Unlock Modal */}
      <Dialog open={pinModalOpen} onOpenChange={(open) => !open && setPinModalOpen(false)}>
        <DialogContent className="photo-pin-dialog-content">
          <div className="photo-pin-header">
            <div className="photo-pin-icon-badge">
              <LockKeyhole size={28} />
            </div>
            <DialogTitle className="photo-pin-title">
              {targetMemory ? `Unlock Memory #${targetMemory.number}` : "Secret Photo Locked"}
            </DialogTitle>
            <DialogDescription className="photo-pin-desc">
              Enter our secret 4-digit PIN to open this memory photo 💕
            </DialogDescription>
          </div>

          <form className="photo-pin-form" onSubmit={handlePinSubmit}>
            <div className={`photo-pin-input-wrap ${isShaking ? "photo-pin-shake" : ""}`}>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                className="photo-pin-input"
              />
            </div>

            {pinError && <p className="photo-pin-error">{pinError}</p>}
            {pinSuccess && <p className="text-sm font-semibold text-emerald-600">Unlocked with love! 💕</p>}

            <div className="photo-pin-actions">
              <button type="submit" className="photo-pin-submit-btn">
                <Heart size={16} fill="currentColor" />
                Unlock This Photo
              </button>
              <button type="button" onClick={handleUnlockAll} className="photo-pin-all-btn">
                <Unlock size={14} />
                Unlock All Photos
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Memory Note Dialog */}
      <Dialog open={selectedMemory !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="memory-dialog-content">
          {selectedMemory && (
            <>
              <DialogHeader>
                <span className="memory-dialog-number">MEMORY {selectedMemory.number}</span>
                <DialogTitle className="memory-dialog-title">{selectedMemory.title}</DialogTitle>
                <DialogDescription>{selectedMemory.teaser}</DialogDescription>
              </DialogHeader>
              {selectedIndex !== null && BUNDLED_MEMORY_PHOTOS[selectedIndex] && (
                <div className="memory-dialog-photo-wrap">
                  <img
                    src={BUNDLED_MEMORY_PHOTOS[selectedIndex]}
                    alt={`Memory ${selectedMemory.number}: ${selectedMemory.title}`}
                    className="memory-dialog-photo"
                  />
                </div>
              )}
              <p className="memory-dialog-copy">{selectedMemory.message}</p>
              <div className="memory-divider" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}