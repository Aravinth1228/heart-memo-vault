import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestUrl } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";

type LoveGateSession = { unlocked?: boolean };

async function getLoveSession() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("SESSION_SECRET is not configured");

  return useSession<LoveGateSession>({
    password,
    name: "aravinthlove-session",
    maxAge: 60 * 60 * 24 * 14,
    cookie: {
      httpOnly: true,
      secure: getRequestUrl().protocol === "https:",
      sameSite: "lax",
      path: "/",
    },
  });
}

async function secureMatch(input: string, expected: string) {
  const encoder = new TextEncoder();
  const [inputDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(input)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(inputDigest);
  const right = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export const getLoveGateStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getLoveSession();
  return { unlocked: Boolean(session.data.unlocked) };
});

export const unlockLoveMemories = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string().max(256) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD is not configured");
    const session = await getLoveSession();
    if (!(await secureMatch(data.password, expected))) return { ok: false as const };

    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockLoveMemories = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getLoveSession();
  await session.clear();
  return { ok: true as const };
});

export const getLoveMemories = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getLoveSession();
  if (!session.data.unlocked) throw redirect({ to: "/" });

  return [
    {
      number: "01",
      title: "Your smile",
      teaser: "You brighten every day",
      quote: "Your smile is my favorite sunrise.",
      message: "Just seeing your smile can make even a difficult day feel beautiful. I hope I get to see it for many, many years.",
    },
    {
      number: "02",
      title: "Our conversations",
      teaser: "The hours that disappear",
      quote: "Every word with you feels like home.",
      message: "When I talk with you, I never notice the time passing. Even the smallest things make me want to reach for you and tell you first.",
    },
    {
      number: "03",
      title: "Your voice",
      teaser: "Close, even from far away",
      quote: "Your voice is the song my heart hums.",
      message: "Your voice has a way of making everything feel calm. Even when we are apart, hearing you makes it feel like you are right beside me.",
    },
    {
      number: "04",
      title: "Little joys",
      teaser: "Simply being together",
      quote: "With you, the little things are everything.",
      message: "We do not need grand plans or big gifts. A little time with you is already one of the happiest things in my life.",
    },
    {
      number: "05",
      title: "On my mind",
      teaser: "A little reminder of you",
      quote: "You are my every passing thought.",
      message: "A song, a passing moment, the smallest thing can bring you to mind. I could never stop thinking of you—and truthfully, I would not want to.",
    },
    {
      number: "06",
      title: "Missing you",
      teaser: "Wish you were here right now",
      quote: "Distance only teaches me how much I love you.",
      message: "I miss having you close. I miss sitting beside you, talking, laughing, or doing absolutely nothing together. I cannot wait to see you again.",
    },
    {
      number: "07",
      title: "It is always you",
      teaser: "My favorite person",
      quote: "Out of everyone, my heart chose you.",
      message: "So many people may come into our lives, but you are the one who feels closest to my heart. I love you more than I can say.",
    },
    {
      number: "08",
      title: "Your kindness",
      teaser: "A beautiful heart",
      quote: "Your heart is the most beautiful thing about you.",
      message: "I love the care you show the people around you and the way you speak to me. Your beauty is not only in your smile; it is in your heart, too.",
    },
    {
      number: "09",
      title: "More memories ahead",
      teaser: "A lifetime of little moments",
      quote: "The best chapters of us are still unwritten.",
      message: "I want us to make so many more memories together: laughter, little trips, late-night talks, and ordinary days made special. I want to fall for you all over again, every day.",
    },
    {
      number: "10",
      title: "Always, Aravinth",
      teaser: "My love is always yours",
      quote: "Near or far, I am forever yours.",
      message: "Near or far, talking or busy, my love for you does not change. I love you so much, and I miss you more than words can hold. Always yours, Aravinth.",
    },
  ];
});