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
      title: "Un sirippu",
      teaser: "En naal azhagaagum neram",
      message:
        "Un sirippu paatha podhum, en naal evlo kashtama irundhaalum konjam azhagaagidum. Adha innum pala varusham paathuttu irukkanum nu aasai.",
    },
    {
      number: "02",
      title: "Namma pechu",
      teaser: "Neram pona theriyadha moments",
      message:
        "Un kooda pesinaa neram eppadi pogudhunnu theriyave theriyadhu. Chinna vishayama irundhaalum un kitta sollanum nu thonradhu, nee enakku evlo special nu nyabagam paduthudhu.",
    },
    {
      number: "03",
      title: "Un kural",
      teaser: "Dhoorathula irundhaalum pakkathula",
      message:
        "Un voice kekkumbodhu manasu calm aagidum. Ippo pakkathula illa naalum, un kural nyabagam vandhaa nee en pakkathula irukkura maadhiri feel aagudhu.",
    },
    {
      number: "04",
      title: "Chinna sandhosham",
      teaser: "Un kooda irundha podhum",
      message:
        "Periya plan-um periya gift-um thevai illa. Un kooda konjam neram irundhaa adhuve enakku romba periya sandhosham.",
    },
    {
      number: "05",
      title: "Un nyabagam",
      teaser: "En manasukulla eppavum",
      message:
        "Busy-a irundhaalum, oru paattu kettaalum, edhaavadhu paathaalum nee nyabagam vandhuduva. Ennaala un ninaivugalai stop panna mudiyala; pannavum viruppam illa.",
    },
    {
      number: "06",
      title: "Miss panren",
      teaser: "Ippo unna paakanum pola",
      message:
        "Ippo nee pakkathula illa nu romba miss panren. Un kooda ukkaandhu pesa, sirikka, onnum pannama summa time spend panna kooda aasaiya irukku. Seekiram paakanum.",
    },
    {
      number: "07",
      title: "Nee dhaan",
      teaser: "Enakku romba pidicha person",
      message:
        "Neraya per namma vaazhkaila varalaam. Aana en manasukku ivlo nerukkama irukkura oruththi nee mattum dhaan. Unna naan romba love panren.",
    },
    {
      number: "08",
      title: "Un kindness",
      teaser: "Un manasu romba azhagu",
      message:
        "Nee mathavanga mela kaattura akkaraiyum, en kitta pesura vidhavum enakku romba pidikkum. Un azhagu mugathula mattum illa; un manasulayum irukku.",
    },
    {
      number: "09",
      title: "Innum pala memories",
      teaser: "Onnaa serndhu seivom",
      message:
        "Namma serndhu innum niraya sirippu, chinna trips, late-night pechu, azhagana memories ellam create pannanum. Ovvoru naalum unna pudhusa love panna aasai.",
    },
    {
      number: "10",
      title: "Always, un Aravinth",
      teaser: "Un mela en anbu kuraivadhillai",
      message:
        "Dhoorathula irundhaalum, pesama irundhaalum, busy-a irundhaalum — un mela irukkura en anbu maaradhu. Unna romba love panren, romba miss panren. Eppavume un Aravinth.",
    },
  ];
});