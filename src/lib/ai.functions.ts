import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLovableAIJson } from "./ai-gateway.server";

// ---------- Captions ----------
const CaptionInput = z.object({
  platform: z.string().min(1).max(50),
  product: z.string().min(1).max(500),
  tone: z.string().min(1).max(50),
  audience: z.string().min(1).max(200),
});

export const generateCaptionsFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CaptionInput.parse(d))
  .handler(async ({ data }) => {
    const result = await callLovableAIJson<{ captions: string[] }>({
      messages: [
        {
          role: "system",
          content:
            "You are an expert social media copywriter. Always reply with valid JSON matching the requested schema. No commentary.",
        },
        {
          role: "user",
          content: `Generate 3 scroll-stopping ${data.platform} captions promoting "${data.product}" for the audience: ${data.audience}. Tone: ${data.tone}. Include relevant emojis and 3-6 hashtags per caption.

Respond as JSON: { "captions": ["caption 1", "caption 2", "caption 3"] }`,
        },
      ],
    });
    if (!Array.isArray(result.captions) || result.captions.length === 0) {
      throw new Error("Model returned no captions");
    }
    return { captions: result.captions.slice(0, 3) };
  });

// ---------- Ad Copy ----------
const AdCopyInput = z.object({
  product: z.string().min(1).max(200),
  audience: z.string().min(1).max(200),
  offer: z.string().min(1).max(300),
  tone: z.string().min(1).max(50),
});

export type AdCopyResult = { headline: string; primaryText: string; cta: string };

export const generateAdCopyFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AdCopyInput.parse(d))
  .handler(async ({ data }) => {
    const result = await callLovableAIJson<AdCopyResult>({
      messages: [
        {
          role: "system",
          content:
            "You are a senior performance-marketing copywriter. Respond ONLY with valid JSON. No commentary.",
        },
        {
          role: "user",
          content: `Write high-converting ad copy.
Product: ${data.product}
Audience: ${data.audience}
Offer: ${data.offer}
Tone: ${data.tone}

Constraints: headline <= 40 chars, primary text 2-3 sentences, CTA 2-4 words.
Respond as JSON: { "headline": "...", "primaryText": "...", "cta": "..." }`,
        },
      ],
    });
    if (!result.headline || !result.primaryText || !result.cta) {
      throw new Error("Incomplete ad copy returned");
    }
    return result;
  });

// ---------- Product Description ----------
const ProductInput = z.object({
  name: z.string().min(1).max(200),
  features: z.string().min(1).max(1000),
  audience: z.string().min(1).max(200),
});

export const generateProductDescriptionFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data }) => {
    const result = await callLovableAIJson<{ description: string }>({
      messages: [
        {
          role: "system",
          content:
            "You are an expert SEO product copywriter. Respond ONLY with valid JSON. No commentary.",
        },
        {
          role: "user",
          content: `Write a single SEO-friendly product description (120-180 words) for "${data.name}". Target audience: ${data.audience}. Key features: ${data.features}.
Include natural keyword usage, benefit-led language, and a closing line that invites action.

Respond as JSON: { "description": "..." }`,
        },
      ],
    });
    if (!result.description) throw new Error("Empty description returned");
    return result;
  });
