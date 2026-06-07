import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLovableAIJson } from "./ai-gateway.server";
import { assertUsageAvailable } from "./usage.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildAdCopyPrompt,
  buildCaptionPrompt,
  buildProductPrompt,
  type AdCopyVars,
} from "./prompts";

async function getBrandVoice(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("brand_voice")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return typeof data?.brand_voice === "string" ? data.brand_voice : "";
}

async function saveGenerationRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  row: {
    type: "caption" | "adcopy" | "product" | "image";
    title: string;
    input: unknown;
    output: unknown;
  },
) {
  const { data, error } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      type: row.type,
      title: row.title,
      input: row.input,
      output: row.output,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ---------- Captions ----------
const CaptionInput = z.object({
  platform: z.string().min(1).max(50),
  product: z.string().min(1).max(500),
  tone: z.string().min(1).max(50),
  audience: z.string().min(1).max(200),
});

export const generateCaptionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CaptionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await getBrandVoice(context.supabase, context.userId);
    const { system, user } = buildCaptionPrompt(data, brandVoice);
    const result = await callLovableAIJson<{ captions: string[] }>({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    if (!Array.isArray(result.captions) || result.captions.length === 0) {
      throw new Error("Model returned no captions");
    }
    const captions = result.captions.slice(0, 3);
    const saved = await saveGenerationRow(context.supabase, context.userId, {
      type: "caption",
      title: `${data.platform} · ${data.product.slice(0, 60)}`,
      input: data,
      output: { captions },
    });
    return { captions, generationId: saved.id };
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
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdCopyInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await getBrandVoice(context.supabase, context.userId);
    const { system, user } = buildAdCopyPrompt(data as AdCopyVars, brandVoice);
    const result = await callLovableAIJson<AdCopyResult>({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    if (!result.headline || !result.primaryText || !result.cta) {
      throw new Error("Incomplete ad copy returned");
    }
    const saved = await saveGenerationRow(context.supabase, context.userId, {
      type: "adcopy",
      title: `Ad · ${data.product.slice(0, 60)}`,
      input: data,
      output: result,
    });
    return { ...result, generationId: saved.id };
  });

// ---------- Product Description ----------
const ProductInput = z.object({
  name: z.string().min(1).max(200),
  features: z.string().min(1).max(1000),
  audience: z.string().min(1).max(200),
});

export const generateProductDescriptionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await getBrandVoice(context.supabase, context.userId);
    const { system, user } = buildProductPrompt(data, brandVoice);
    const result = await callLovableAIJson<{ description: string }>({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    if (!result.description) throw new Error("Empty description returned");
    const saved = await saveGenerationRow(context.supabase, context.userId, {
      type: "product",
      title: `Product · ${data.name}`,
      input: data,
      output: result,
    });
    return { description: result.description, generationId: saved.id };
  });
