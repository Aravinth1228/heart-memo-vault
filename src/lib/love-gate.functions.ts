import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestUrl } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";

type LoveGateSession = { unlocked?: boolean };

async function getLoveSession() {
  const password = process.env["SESSION_SECRET"] || "aravinth-love-secret-key-32-chars-minimum-length";

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
    const expected = process.env["SITE_PASSWORD"] || "love";
    const session = await getLoveSession();
    const inputLower = data.password.trim().toLowerCase();
    const isMatch =
      (await secureMatch(data.password, expected)) ||
      (await secureMatch(inputLower, expected.toLowerCase())) ||
      (await secureMatch(inputLower, "love")) ||
      (await secureMatch(inputLower, "1216")) ||
      (await secureMatch(inputLower, "aravinth")) ||
      (await secureMatch(inputLower, "mrs aravinth")) ||
      (await secureMatch(inputLower, "mrs. aravinth"));

    if (!isMatch) return { ok: false as const };

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
      title: "The Promise",
      teaser: "The moment I slipped the ring onto your finger",
      quote: "That ring was just a symbol; my heart was already yours.",
      message: "Holding your hand and sliding that ring onto your finger under that tree was the easiest and most beautiful promise I ever made. I knew right then that I want to hold this hand for the rest of my life.",
    },
    {
      number: "02",
      title: "Your Cute Drama",
      teaser: "The way you playfully roll your eyes at me",
      quote: "Your silly expressions are my absolute favorite.",
      message: "Whenever you roll your eyes, pretend to be grumpy, or cross your arms like this, I fall in love with you all over again. Your mischievous humor makes every single second unforgettable.",
    },
    {
      number: "03",
      title: "Lost in Your Eyes",
      teaser: "Quiet moments under green bamboo",
      quote: "The whole world fades away when you look at me.",
      message: "Standing among the bamboo trees, looking into your eyes, everything around us just silenced. You in pink and that sweet smile of yours is etched in my heart forever.",
    },
    {
      number: "04",
      title: "Our Bike Rides",
      teaser: "Wind in your hair, hand on my shoulder",
      quote: "Any road is beautiful as long as you're riding behind me.",
      message: "Feeling your hand gently resting on my shoulder as we ride together into the breeze is pure bliss. With you sitting behind me, every road feels like paradise.",
    },
    {
      number: "05",
      title: "Classroom Days",
      teaser: "Quiet corners and stolen glances between benches",
      quote: "The best part of college was having you right there.",
      message: "Between those wooden benches and empty classrooms, we created our fondest memories. College was just another place until you walked in and made it my favorite world.",
    },
    {
      number: "06",
      title: "By Your Side",
      teaser: "Your hand over my beating heart",
      quote: "With your hand against my chest, my heart beats only for you.",
      message: "Seeing you dressed in white like an angel, resting your hand on my chest... all I felt in that moment was gratitude and pride that you chose me to love you.",
    },
    {
      number: "07",
      title: "Sunshine & Jasmine",
      teaser: "Mallipoo in your hair and your brightest smile",
      quote: "Brighter than the sun, sweeter than fresh jasmine.",
      message: "That sunny afternoon with mallipoo in your hair and that bright smile—you lit up the entire campus. Just seeing that smile can wash away any exhaustion in an instant.",
    },
    {
      number: "08",
      title: "Made for Each Other",
      teaser: "Twinning in royal wine-purple and veshti",
      quote: "Side by side, we belong together in every lifetime.",
      message: "Dressed in matching purple, you looked like royalty. Standing beside you makes me stand a little taller and smile a little wider. We are truly made for each other.",
    },
    {
      number: "09",
      title: "In My Arms",
      teaser: "Held close, right where you belong",
      quote: "In my arms is where you will always be safe and cherished.",
      message: "Wrapping my arm around you and feeling you hold onto me—that is my favorite place in the entire world. I promise to always hold you this close and protect your smile.",
    },
    {
      number: "10",
      title: "Your Warmth",
      teaser: "Leaning on my shoulder with that gentle smile",
      quote: "My shoulder will forever be your place to rest.",
      message: "Whenever you rest your head on my shoulder and look into the camera with those glasses, my world feels complete. You are my comfort, my peace, and my home.",
    },
    {
      number: "11",
      title: "Shaded Together",
      teaser: "Quiet breeze under the tree canopy",
      quote: "Life's sweetest moments are the quiet ones with you.",
      message: "Just standing together under the cool shade of that tree, sharing easy smiles and holding hands. We don't need grand plans; just having you near is everything.",
    },
    {
      number: "12",
      title: "Desk Conversations",
      teaser: "Chasing deadlines and sharing laughter",
      quote: "Every long day turns into joy when I sit next to you.",
      message: "Sitting side by side at that desk, sharing screens, laughs, and secret whispers. You turned boring lab hours into memories I will look back on for the rest of my life.",
    },
    {
      number: "13",
      title: "The Look of Love",
      teaser: "When you look up at me like that",
      quote: "In your eyes, I see my past, present, and forever.",
      message: "The way you look up into my eyes with that sweet smile—it makes time stand still. Out of all the people in the world, having you look at me like that is my greatest treasure.",
    },
    {
      number: "14",
      title: "Always Close",
      teaser: "Your arm around my neck, smiling from the heart",
      quote: "Distance can never touch what we hold in our hearts.",
      message: "That genuine, warm embrace with your arm around my neck and both of us smiling from ear to ear. Every time I see this picture, I fall in love with you all over again.",
    },
    {
      number: "15",
      title: "Traditional Grace",
      teaser: "Dhoti, floral gown, and a lifetime under the banyan tree",
      quote: "Under that banyan tree, our love felt timeless.",
      message: "You looked breathtaking in that floral dress and green dupatta, and having you hold onto my shoulder under the grand tree felt like a scene from a dream. You are my queen.",
    },
    {
      number: "16",
      title: "Sweetest Pose",
      teaser: "Resting your chin with that precious smile",
      quote: "Approved by love: you are and will always be my number one.",
      message: "Seeing you rest your chin so cutely while I flash a thumbs-up—this photo captures our real, unfiltered happiness. You bring out the brightest version of me.",
    },
    {
      number: "17",
      title: "Blossom",
      teaser: "Framing your face like the prettiest flower",
      quote: "Even flowers would be jealous of your radiance.",
      message: "Framing your face with your hands like a blooming flower! Your smile in this picture is so radiant it could light up the darkest night. Keep smiling like this forever, my love.",
    },
    {
      number: "18",
      title: "Always & Forever",
      teaser: "Twinned in purple with sparkles in our eyes",
      quote: "Two hearts beating in harmony, now and forever.",
      message: "Twinning in purple once again, with matching smiles and pure happiness. No matter where life takes us, my thumbs-up will always say: you are my girl, and I am forever yours, Aravinth.",
    },
  ];
});