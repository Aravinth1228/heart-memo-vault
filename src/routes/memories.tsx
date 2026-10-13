import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Heart, ImagePlus, LockKeyhole, Sparkles } from "lucide-react";

import loveBackdrop from "@/assets/love-memory-backdrop.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getLoveMemories,
  lockLoveMemories,
} from "@/lib/love-gate.functions";

export const Route = createFileRoute("/memories")({
  loader: () => getLoveMemories(),
  head: () => ({
    meta: [
      { title: "Namma Ninaivugal — Aravinthlove" },
      {
        name: "description",
        content: "Aravinthin kaadhalum miss panra ninaivugalum — ungalukkaaga mattum.",
      },
      { property: "og:title", content: "Namma Ninaivugal — Aravinthlove" },
      {
        property: "og:description",
        content: "Aravinthin kaadhalum miss panra ninaivugalum — ungalukkaaga mattum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoriesPage,
});

const PHOTO_STORAGE_KEY = "aravinthlove-photos-v1";

function MemoriesPage() {
  const memories = Route.useLoaderData();
  const navigate = useNavigate();
  const lockMemories = useServerFn(lockLoveMemories);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [uploadNotice, setUploadNotice] = useState("");

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
          setPhotos(safePhotos);
        }
      }
    } catch {
      setUploadNotice("Saved photos-a open panna mudiyala. Oru pudhu photo add panni paarunga.");
    }
  }, [memories.length]);

  function addPhoto(photoIndex: number, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadNotice("Image file mattum select pannunga.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const nextPhotos = { ...photos, [photoIndex]: reader.result };
      try {
        localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(nextPhotos));
        setPhotos(nextPhotos);
        setUploadNotice("Photo save aayiduchu.");
      } catch {
        setUploadNotice("Indha photo romba perusa irukku. Konjam chinna photo select pannunga.");
      }
    };
    reader.onerror = () => setUploadNotice("Indha photo-va load panna mudiyala. Vera photo try pannunga.");
    reader.readAsDataURL(file);
  }

  async function handleLock() {
    await lockMemories();
    await navigate({ to: "/" });
  }

  const selectedMemory = selectedIndex === null ? null : memories[selectedIndex];

  return (
    <main
      className="memory-page"
      style={{ "--memory-wallpaper": `url("${loveBackdrop}")` } as React.CSSProperties}
    >
      <header className="memory-topbar memory-shell">
        <a className="memory-brand" href="/memories" aria-label="Aravinthlove memories">
          <span className="memory-brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span>Aravinthlove</span>
        </a>
        <Button variant="ghost" size="sm" onClick={handleLock} aria-label="Lock memories">
          <LockKeyhole size={16} />
          Lock
        </Button>
      </header>

      <section className="memory-shell" aria-labelledby="memory-title">
        <header className="memory-collection-header">
          <div className="memory-kicker"><Sparkles size={15} /> Unakku mattum, en anbudan</div>
          <h1 className="memory-title" id="memory-title">Namma ninaivugal</h1>
          <p className="memory-lede">
            Ovvoru padathukkullayum namma oru azhagana nyabagam irukku.
            Unna evlo love panren, evlo miss panren nu indha chinna idathula vechurukken.
          </p>
          <span className="memory-count"><Heart size={14} fill="currentColor" /> 10 chinna love notes</span>
        </header>

        <div className="memory-collection">
          {memories.map((memory, index) => (
            <article className="memory-item" key={memory.number}>
              <Button
                variant="ghost"
                className="memory-card-button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Open memory ${memory.number}: ${memory.title}`}
              >
                <span className="memory-card-photo">
                  <span className="memory-number">{memory.number}</span>
                  {photos[index] ? (
                    <img src={photos[index]} alt={`Ninaivu ${memory.number}: ${memory.title}`} />
                  ) : (
                    <span className="memory-photo-placeholder"><Heart size={23} /></span>
                  )}
                </span>
                <span className="memory-card-copy">
                  <span className="memory-card-title">{memory.title}</span>
                  <span className="memory-card-teaser">{memory.teaser}</span>
                </span>
              </Button>
              <div className="memory-upload-row">
                <label className="memory-upload-label" htmlFor={`photo-${index}`}>
                  {photos[index] ? "Photo maathu" : "Photo seru"}
                </label>
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
                    <span className="sr-only">Choose photo for {memory.title}</span>
                  </label>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="memory-storage-note" role="status">
          {uploadNotice || "Ungal photos indha browser-la mattum save aagum."}
        </p>
        <footer className="memory-footer"><Heart size={13} fill="currentColor" /> Eppavume un Aravinth</footer>
      </section>

      <Dialog open={selectedMemory !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="memory-dialog-content">
          {selectedMemory && (
            <>
              <DialogHeader>
                <span className="memory-dialog-number">NYAABAGAM {selectedMemory.number}</span>
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