import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const LOVABLE_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_RUN_ID_HEADER)) {
        headers.set(LOVABLE_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
    getRunId: () => runId,
  };
}

const MODEL = "openai/gpt-6-astra";

export async function writeLoveMessage(
  memory: string,
  tone: "longing" | "deep" | "sweet",
  initialRunId?: string,
) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("AI love notes are not configured right now.");
  }

  const gateway = createRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: gateway.fetch,
  });

  const toneDirections = {
    longing: "deeply longing and missing her, tender and sincere",
    deep: "deep, steady and heartfelt love, intimate and sincere",
    sweet: "sweet, affectionate, warm and gently playful",
  };

  const result = streamText({
    model: provider.responses(MODEL),
    instructions:
      "Write a personal, heartfelt love note from Aravinth to his girlfriend, grounded only in the shared memory supplied. Express love and missing her naturally, without inventing details or sounding generic. Write in warm conversational Tanglish (Tamil written with English letters), about 3 to 5 sentences. Return only the note.",
    prompt: `Shared memory: ${memory}\nTone: ${toneDirections[tone]}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const message = (await result.text).trim();
  if (!message) {
    throw new Error("The note came back empty. Please try again.");
  }
  return { message };
}