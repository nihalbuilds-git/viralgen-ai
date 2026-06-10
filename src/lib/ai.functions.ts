import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLovableAIJson } from "./ai-gateway.server";
import { assertUsageAvailable } from "./usage.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveBrandVoice } from "./brand-profiles.functions";
import {
  buildAdCopyPrompt,
  buildCaptionPrompt,
  buildProductPrompt,
  type AdCopyVars,
} from "./prompts";

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

async function trackGenerationEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  type: string,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event", "generation_completed");
    const isFirst = (count ?? 0) === 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("analytics_events").insert([
      { user_id: userId, event: "generation_completed", properties: { type } },
      ...(isFirst
        ? [{ user_id: userId, event: "first_generation", properties: { type } }]
        : []),
    ]);
  } catch {
    // analytics is best-effort; never block a generation
  }
}

// ---------- Captions ----------
const CaptionInput = z.object({
  platform: z.string().min(1).max(50),
  product: z.string().min(1).max(500),
  tone: z.string().min(1).max(50),
  audience: z.string().min(1).max(200),
  brandProfileId: z.string().uuid().nullable().optional(),
});

export const generateCaptionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CaptionInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await resolveBrandVoice(
      context.supabase,
      context.userId,
      data.brandProfileId ?? null,
    );
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
    void trackGenerationEvent(context.supabase, context.userId, "caption");
    return { captions, generationId: saved.id };
  });

// ---------- Ad Copy ----------
const AdCopyInput = z.object({
  product: z.string().min(1).max(200),
  audience: z.string().min(1).max(200),
  offer: z.string().min(1).max(300),
  tone: z.string().min(1).max(50),
  brandProfileId: z.string().uuid().nullable().optional(),
});

export type AdCopyResult = { headline: string; primaryText: string; cta: string };

export const generateAdCopyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdCopyInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await resolveBrandVoice(
      context.supabase,
      context.userId,
      data.brandProfileId ?? null,
    );
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
    void trackGenerationEvent(context.supabase, context.userId, "adcopy");
    return { ...result, generationId: saved.id };
  });

// ---------- Product Description ----------
const ProductInput = z.object({
  name: z.string().min(1).max(200),
  features: z.string().min(1).max(1000),
  audience: z.string().min(1).max(200),
  brandProfileId: z.string().uuid().nullable().optional(),
});

export const generateProductDescriptionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertUsageAvailable(context.supabase, context.userId, "text");
    const brandVoice = await resolveBrandVoice(
      context.supabase,
      context.userId,
      data.brandProfileId ?? null,
    );
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
    void trackGenerationEvent(context.supabase, context.userId, "product");
    return { description: result.description, generationId: saved.id };
  });
