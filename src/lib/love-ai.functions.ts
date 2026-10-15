import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { writeLoveMessage } from "@/lib/love-ai.server";

export const generateLoveMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        memory: z.string().trim().min(3).max(500),
        tone: z.enum(["longing", "deep", "sweet"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => writeLoveMessage(data.memory, data.tone));