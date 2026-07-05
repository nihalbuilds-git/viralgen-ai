import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

const ListInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
});

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    // Pull profile rows (RLS: admin policy allows SELECT all).
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const ids = (profiles ?? []).map((p) => p.id);
    if (ids.length === 0) return [];

    const [{ data: subs }, { data: genRows }] = await Promise.all([
      supabase
        .from("user_subscriptions")
        .select("user_id, plan_id, period_start")
        .in("user_id", ids),
      supabase
        .from("generations")
        .select("user_id, viral_score, created_at")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    const subByUser = new Map<string, { plan_id: string; period_start: string }>();
    for (const s of subs ?? []) subByUser.set(s.user_id, s);

    const stats = new Map<
      string,
      { total: number; last: string | null; scoreSum: number; scoreCount: number }
    >();
    for (const r of genRows ?? []) {
      const s = stats.get(r.user_id) ?? { total: 0, last: null, scoreSum: 0, scoreCount: 0 };
      s.total += 1;
      if (!s.last || r.created_at > s.last) s.last = r.created_at;
      if (typeof r.viral_score === "number") {
        s.scoreSum += r.viral_score;
        s.scoreCount += 1;
      }
      stats.set(r.user_id, s);
    }

    return (profiles ?? []).map((p) => {
      const s = stats.get(p.id);
      const sub = subByUser.get(p.id);
      return {
        id: p.id,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        createdAt: p.created_at,
        planId: sub?.plan_id ?? "free",
        periodStart: sub?.period_start ?? null,
        generations: s?.total ?? 0,
        lastGeneration: s?.last ?? null,
        avgViral: s && s.scoreCount ? Math.round(s.scoreSum / s.scoreCount) : null,
      };
    });
  });

export const adminListGenerations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("generations")
      .select("id, user_id, type, title, viral_score, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: users }, { count: gensTotal }, { count: gens24h }, { count: gens7d }, subs] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("generations").select("id", { count: "exact", head: true }),
        supabase
          .from("generations")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since24h),
        supabase
          .from("generations")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7d),
        supabase.from("user_subscriptions").select("plan_id"),
      ]);

    const planCounts: Record<string, number> = {};
    for (const s of subs.data ?? []) {
      planCounts[s.plan_id] = (planCounts[s.plan_id] ?? 0) + 1;
    }

    return {
      users: users ?? 0,
      generationsTotal: gensTotal ?? 0,
      generations24h: gens24h ?? 0,
      generations7d: gens7d ?? 0,
      planCounts,
    };
  });
