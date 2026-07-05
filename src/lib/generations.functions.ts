import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertRateLimit, assertUsageAvailable, getUsageSummary } from "./usage.server";
import { computeViralScore } from "./viral-score";
import { outputToText } from "./export";

const TypeEnum = z.enum(["caption", "adcopy", "product", "image"]);

async function withSignedImageUrls(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
) {
  return Promise.all(
    rows.map(async (row) => {
      const output = row?.output as Record<string, unknown> | null;
      if (row?.type !== "image" || typeof output?.imagePath !== "string") return row;
      const { data } = await supabase.storage
        .from("generated-images")
        .createSignedUrl(output.imagePath, 60 * 30);
      return {
        ...row,
        output: {
          ...output,
          imageUrl: data?.signedUrl ?? null,
        },
      };
    }),
  );
}

const SaveInput = z.object({
  type: TypeEnum,
  title: z.string().min(1).max(200),
  input: z.record(z.string(), z.unknown()).default({}),
  output: z.record(z.string(), z.unknown()).default({}),
});

export const saveGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const kind = data.type === "image" ? "image" : "text";
    await assertRateLimit(supabase, userId, kind);
    await assertUsageAvailable(supabase, userId, kind);
    const viralScore =
      data.type === "image" ? null : computeViralScore(outputToText(data.output));
    const { data: row, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        input: data.input as never,
        output: data.output as never,
        viral_score: viralScore,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const ListInput = z.object({
  type: TypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const listGenerations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.type) q = q.eq("type", data.type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return withSignedImageUrls(supabase, rows ?? []);
  });

const IdInput = z.object({ id: z.string().uuid() });

export const getFavoriteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("generation_id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { favorited: Boolean(existing) };
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("generation_id", data.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, generation_id: data.id });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

const BulkIdsInput = z.object({
  generationIds: z.array(z.string().uuid()).min(1).max(200),
});

export const bulkRemoveFavorites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BulkIdsInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .in("generation_id", data.generationIds);
    if (error) throw new Error(error.message);
    return { removed: data.generationIds.length };
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorites")
      .select("id, created_at, generation:generations(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return Promise.all(
      (data ?? []).map(async (row) => {
        if (!row.generation) return row;
        const [generation] = await withSignedImageUrls(supabase, [row.generation]);
        return { ...row, generation };
      }),
    );
  });

export const getMyUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getUsageSummary(context.supabase, context.userId));

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("generations")
      .select("type, title, output, created_at, viral_score")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const byType: Record<string, number> = {};
    const daily = Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (13 - index));
      return {
        key: day.toISOString().slice(0, 10),
        day: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        generations: 0,
        words: 0,
      };
    });

    let totalWords = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    for (const row of rows) {
      byType[row.type] = (byType[row.type] ?? 0) + 1;
      const words = JSON.stringify(row.output ?? {})
        .split(/\s+/)
        .filter(Boolean).length;
      totalWords += words;
      if (typeof row.viral_score === "number") {
        scoreSum += row.viral_score;
        scoreCount += 1;
      }
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      const day = daily.find((item) => item.key === key);
      if (day) {
        day.generations += 1;
        day.words += words;
      }
    }

    const totals = Object.entries(byType).map(([name, value]) => ({ name, value }));
    const totalGenerations = rows.length;
    const avgViral = scoreCount ? Math.round(scoreSum / scoreCount) : 0;

    return {
      totals,
      daily: daily.map(({ key: _key, ...item }) => item),
      totalGenerations,
      totalWords,
      avgViral,
      hoursSaved: Math.round(totalGenerations * 0.25),
      quality: [
        { metric: "Hook strength", score: Math.min(95, avgViral + 3) },
        { metric: "Clarity", score: Math.min(95, avgViral + 8) },
        { metric: "Emotion", score: Math.max(55, avgViral - 6) },
        { metric: "CTA", score: Math.max(50, avgViral - 10) },
        { metric: "Brand voice", score: Math.min(95, avgViral + 1) },
        { metric: "Shareability", score: Math.min(98, avgViral + 6) },
      ],
    };
  });
