import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getRequest } from "@tanstack/react-start/server";

import { createLovableAiGatewayRunIdFetch } from "@/lib/ai-gateway-run-id";

const LOVABLE_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

const MODEL = "openai/gpt-6-astra";

type GatewayFailure = {
  status?: number | undefined;
  kind?: string | undefined;
  message?: string | undefined;
};

function readFailure(error: unknown): GatewayFailure {
  if (!error || typeof error !== "object") return {};
  const item = error as Record<string, unknown>;
  const cause = item["cause"] && typeof item["cause"] === "object"
    ? (item["cause"] as Record<string, unknown>)
    : {};
  const status = [item["statusCode"], item["status"], cause["statusCode"], cause["status"]].find(
    (value): value is number => typeof value === "number",
  );
  const bodies = [item["responseBody"], cause["responseBody"], item["message"], cause["message"]];

  for (const body of bodies) {
    if (typeof body !== "string") continue;
    try {
      const parsed: unknown = JSON.parse(body);
      if (parsed && typeof parsed === "object") {
        const payload = parsed as Record<string, unknown>;
        return {
          status,
          kind: typeof payload["type"] === "string" ? payload["type"] : undefined,
          message: typeof payload["message"] === "string" ? payload["message"] : undefined,
        };
      }
    } catch {
      // Non-JSON error strings are intentionally not shown to visitors.
    }
  }
  return { status };
}

function isWorkspaceAccessBlock(failure: GatewayFailure) {
  const kind = failure.kind?.toLowerCase() ?? "";
  const message = failure.message?.toLowerCase() ?? "";
  return (
    kind === "credit_limit_reached" ||
    kind === "ai_disabled" ||
    message.includes("workspace") ||
    message.includes("credit limit") ||
    message.includes("ai is disabled")
  );
}

async function getPersistedProviderDenial() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("ai_gateway_access_state")
    .select("denial_message")
    .eq("state_key", "workspace_gateway")
    .maybeSingle();
  if (error) throw new Error("AI notes are temporarily unavailable.");
  return data?.denial_message ?? null;
}

async function persistProviderDenial(message: string, kind: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("ai_gateway_access_state").upsert({
    state_key: "workspace_gateway",
    denial_message: message,
    state_kind: kind,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("AI notes are temporarily unavailable.");
}

export async function writeLoveMessage(
  memory: string,
  tone: "longing" | "deep" | "sweet",
) {
  try {
    const savedDenial = await getPersistedProviderDenial();
    if (savedDenial) return { ok: false as const, error: savedDenial };
  } catch {
    return { ok: false as const, error: "AI notes are temporarily unavailable." };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return { ok: false as const, error: "AI notes are not configured right now." };
  }

  const request = getRequest();
  const gateway = createLovableAiGatewayRunIdFetch(
    request.headers.get(LOVABLE_RUN_ID_HEADER) ?? undefined,
  );
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
    abortSignal: request.signal,
    maxRetries: 0,
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

  try {
    const [messageText, finishReason] = await Promise.all([result.text, result.finishReason]);
    if (finishReason === "content-filter") {
      return { ok: false as const, error: "The AI service declined to write this note." };
    }
    const message = messageText.trim();
    if (!message) {
      return { ok: false as const, error: "The AI service returned an empty note. Please try again." };
    }
    return { ok: true as const, message };
  } catch (error) {
    const failure = readFailure(error);
    if (failure.status === 403 && !isWorkspaceAccessBlock(failure)) {
      const denial = failure.message ?? "AI writing access is currently unavailable for this workspace.";
      try {
        await persistProviderDenial(denial, failure.kind ?? "provider_access_denied");
      } catch {
        return { ok: false as const, error: "AI writing access is unavailable. Please contact the workspace owner." };
      }
      return { ok: false as const, error: denial };
    }
    if (failure.status === 401) {
      return { ok: false as const, error: "AI notes are not configured correctly right now." };
    }
    if (failure.status === 429) {
      return { ok: false as const, error: failure.message ?? "AI writing is busy. Please try again later." };
    }
    if (failure.status === 402 || failure.status === 403) {
      return { ok: false as const, error: failure.message ?? "AI writing is unavailable right now." };
    }
    if (failure.status && failure.status >= 500) {
      return { ok: false as const, error: failure.message ?? "AI writing is temporarily unavailable." };
    }
    return {
      ok: false as const,
      error: error instanceof Error && error.name === "AbortError"
        ? "The note request was stopped."
        : failure.message ?? "Could not write the note right now. Please try again.",
    };
  }
}