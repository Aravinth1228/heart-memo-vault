import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Heart, ImagePlus, LockKeyhole, Mail, Sparkles } from "lucide-react";

import loveBackdrop from "@/assets/love-memory-backdrop.jpg";
import memory01 from "@/assets/memory-01.webp.asset.json";
import memory02 from "@/assets/memory-02.png.asset.json";
import memory03 from "@/assets/memory-03.webp.asset.json";
import memory04 from "@/assets/memory-04.png.asset.json";
import memory05 from "@/assets/memory-05.webp.asset.json";
import memory06 from "@/assets/memory-06.webp.asset.json";
import memory07 from "@/assets/memory-07.webp.asset.json";
import memory08 from "@/assets/memory-08.webp.asset.json";
import memory09 from "@/assets/memory-09.webp.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateLoveMessage } from "@/lib/love-ai.functions";
import {
  getLoveMemories,
  lockLoveMemories,
} from "@/lib/love-gate.functions";

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

const PHOTO_STORAGE_KEY = "aravinthlove-photos-v1";
const BUNDLED_MEMORY_PHOTOS = [
  memory01.url,
  memory02.url,
  memory03.url,
  memory04.url,
  memory05.url,
  memory06.url,
  memory07.url,
  memory08.url,
  memory09.url,
];

const DEFAULT_PHOTOS = Object.fromEntries(
  BUNDLED_MEMORY_PHOTOS.map((url, index) => [index, url]),
);

function MemoriesPage() {
  const memories = Route.useLoaderData();
  const navigate = useNavigate();
  const lockMemories = useServerFn(lockLoveMemories);
  const generateNote = useServerFn(generateLoveMessage);
  const [photos, setPhotos] = useState<Record<number, string>>(DEFAULT_PHOTOS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openCards, setOpenCards] = useState<Set<number>>(() => new Set());
  const [uploadNotice, setUploadNotice] = useState("");
  const [sharedMemory, setSharedMemory] = useState("");
  const [tone, setTone] = useState<"longing" | "deep" | "sweet">("longing");
  const [loveNote, setLoveNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PHOTO_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const safePhotos: Record<number, string> = {};
          for (const [key, value] of Object.entries(parsed)) {
            const photoNumber = Number(key);
            if (
              Number.isInteger(photoNumber) &&
              photoNumber >= 0 &&
              photoNumber < memories.length &&
              typeof value === "string" &&
              value.startsWith("data:image/")
            ) {
              safePhotos[photoNumber] = value;
            }
          }
          setPhotos({ ...DEFAULT_PHOTOS, ...safePhotos });
        }
      }
    } catch {
      setUploadNotice("Saved photos could not be opened. Try adding a photo again.");
    }
  }, [memories.length]);

  function addPhoto(photoIndex: number, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadNotice("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const nextPhotos = { ...photos, [photoIndex]: reader.result };
      try {
        localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(nextPhotos));
        setPhotos(nextPhotos);
        setUploadNotice("Photo saved in this browser.");
      } catch {
        setUploadNotice("This photo is too large. Please choose a smaller image.");
      }
    };
    reader.onerror = () => setUploadNotice("This photo could not be loaded. Please try another one.");
    reader.readAsDataURL(file);
  }

  async function handleLock() {
    await lockMemories();
    await navigate({ to: "/" });
  }

  async function handleGenerateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoteError("");
    setLoveNote("");
    setIsCopied(false);
    setIsGenerating(true);
    try {
      const result = await generateNote({ data: { memory: sharedMemory, tone } });
      if (result.ok) setLoveNote(result.message);
      else setNoteError(result.error);
    } catch {
      setNoteError("Your love note could not be written right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyNote() {
    try {
      await navigator.clipboard.writeText(loveNote);
      setIsCopied(true);
      setNoteError("");
    } catch {
      setIsCopied(false);
      setNoteError("This browser could not copy the note. Please select and copy it instead.");
    }
  }

  function toggleCard(index: number) {
    setOpenCards((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const selectedMemory = selectedIndex === null ? null : memories[selectedIndex];

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
          <span className="memory-brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span>Mrs. Aravinth</span>
        </a>
        <Button variant="ghost" size="sm" onClick={handleLock} aria-label="Lock memories">
          <LockKeyhole size={16} />
          Lock
        </Button>
      </header>

      <section className="memory-shell" aria-labelledby="memory-title">
        <header className="memory-collection-header">
          <div className="memory-kicker"><Sparkles size={15} /> Just for you, with all my love</div>
          <h1 className="memory-title" id="memory-title">Our memories</h1>
          <p className="memory-lede">
            Every photo holds a little piece of us. Here are a few reminders of how much I love
            you and how much I miss you.
          </p>
          <span className="memory-count"><Heart size={14} fill="currentColor" /> 10 little love notes</span>
        </header>

        <section className="memory-ai-section" aria-labelledby="memory-ai-title">
          <div className="memory-ai-intro">
            <div className="memory-kicker"><Sparkles size={15} /> A note from the heart</div>
            <h2 className="memory-ai-title" id="memory-ai-title">Turn a memory into a love note</h2>
            <p className="memory-ai-copy">
              Share a little moment, and I’ll turn it into a heartfelt message about loving and
              missing you.
            </p>
          </div>
          <form className="memory-ai-tool" onSubmit={handleGenerateNote}>
            <label className="memory-ai-label" htmlFor="shared-memory">A memory we share</label>
            <Textarea
              id="shared-memory"
              className="memory-ai-textarea"
              placeholder="Tell me about a moment you love remembering…"
              value={sharedMemory}
              onChange={(event) => setSharedMemory(event.currentTarget.value)}
              minLength={3}
              maxLength={500}
              required
            />
            <div className="memory-ai-meta">
              <span>Choose a feeling</span>
              <span>{sharedMemory.length}/500</span>
            </div>
            <div className="memory-ai-tones" role="group" aria-label="Love note tone">
              {([
                ["longing", "Missing you"],
                ["deep", "Deep love"],
                ["sweet", "Sweet & warm"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={tone === value ? "default" : "outline"}
                  aria-pressed={tone === value}
                  onClick={() => setTone(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button className="memory-ai-generate" type="submit" disabled={isGenerating || sharedMemory.trim().length < 3}>
              <Heart size={16} fill="currentColor" />
              {isGenerating ? "Writing your note…" : "Write my love note"}
            </Button>
            {noteError && <p className="memory-ai-error" role="alert">{noteError}</p>}
            {loveNote && (
              <div className="memory-ai-result">
                <div className="memory-ai-result-heading">
                  <span>Your love note</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyNote}
                    aria-label={isCopied ? "Love note copied" : "Copy love note"}
                    title={isCopied ? "Copied" : "Copy love note"}
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="memory-ai-note" aria-live="polite">{loveNote}</p>
              </div>
            )}
          </form>
        </section>

        <div className="memory-collection">
          {memories.map((memory, index) => {
            const isOpen = openCards.has(index);
            return (
            <article className="memory-item" key={memory.number}>
              <button
                type="button"
                className={`memory-flip${isOpen ? " is-open" : ""}`}
                onClick={() => toggleCard(index)}
                aria-pressed={isOpen}
                aria-label={isOpen ? `Close memory ${memory.number}: ${memory.title}` : `Tap to open memory ${memory.number}: ${memory.title}`}
              >
                <span className="memory-flip-inner">
                  <span className="memory-flip-front" aria-hidden={isOpen}>
                    <span className="memory-number">{memory.number}</span>
                    <span className="memory-envelope"><Mail size={26} /><Heart className="memory-envelope-heart" size={14} fill="currentColor" /></span>
                    <span className="memory-flip-title">{memory.title}</span>
                    <span className="memory-flip-hint">Tap to open</span>
                  </span>
                  <span className="memory-flip-back" aria-hidden={!isOpen}>
                    <span className="memory-card-photo">
                      {isOpen && photos[index] ? (
                        <img src={photos[index]} alt={`Memory ${memory.number}: ${memory.title}`} />
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
              <div className="memory-upload-row">
                <Button variant="ghost" size="sm" className="memory-upload-trigger" onClick={() => setSelectedIndex(index)}>
                  <Heart size={14} /> Read note
                </Button>
                <Input
                  id={`photo-${index}`}
                  className="memory-upload-input"
                  type="file"
                  accept="image/*"
                  aria-label={`Upload photo for memory ${memory.number}`}
                  onChange={(event) => addPhoto(index, event.currentTarget.files?.[0])}
                />
                <Button asChild variant="ghost" size="sm" className="memory-upload-trigger">
                  <label htmlFor={`photo-${index}`}>
                    <ImagePlus size={15} />
                    {photos[index] ? "Change" : "Add photo"}
                  </label>
                </Button>
              </div>
            </article>
            );
          })}
        </div>


        <p className="memory-storage-note" role="status">
          {uploadNotice || "Your own photos are saved in this browser only."}
        </p>
        <footer className="memory-footer"><Heart size={13} fill="currentColor" /> Always yours, Aravinth</footer>
      </section>

      <Dialog open={selectedMemory !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="memory-dialog-content">
          {selectedMemory && (
            <>
              <DialogHeader>
                <span className="memory-dialog-number">MEMORY {selectedMemory.number}</span>
                <DialogTitle className="memory-dialog-title">{selectedMemory.title}</DialogTitle>
                <DialogDescription>{selectedMemory.teaser}</DialogDescription>
              </DialogHeader>
              <p className="memory-dialog-copy">{selectedMemory.message}</p>
              <div className="memory-divider" aria-hidden="true"><Heart size={16} fill="currentColor" /></div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}