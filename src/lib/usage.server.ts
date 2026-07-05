import { PLAN_BY_ID, type PlanId } from "./plans";

export const USAGE_LIMIT_CODE = "USAGE_LIMIT_REACHED";
export const RATE_LIMIT_CODE = "RATE_LIMIT_EXCEEDED";

export type GenerationKind = "text" | "image";

export class UsageLimitError extends Error {
  code = USAGE_LIMIT_CODE;
  status = 402;

  constructor(message: string) {
    super(`${USAGE_LIMIT_CODE}: ${message}`);
    this.name = "UsageLimitError";
  }
}

export class RateLimitError extends Error {
  code = RATE_LIMIT_CODE;
  status = 429;
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message?: string) {
    super(
      `${RATE_LIMIT_CODE}: ${
        message ??
        `You're generating too quickly. Try again in ${retryAfterSeconds}s.`
      }`,
    );
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Per-user, per-bucket rolling window rate limit backed by the
// `consume_rate_limit` Postgres function (atomic upsert + counter).
// Called on every generation endpoint so a runaway client can't hammer
// the AI gateway even when their monthly quota still has room.
export const RATE_BUCKETS = {
  text: { bucket: "generate:text", max: 12, windowSeconds: 60 },
  image: { bucket: "generate:image", max: 4, windowSeconds: 60 },
} as const;

export async function assertRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  kind: GenerationKind,
) {
  const cfg = RATE_BUCKETS[kind];
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    _user_id: userId,
    _bucket: cfg.bucket,
    _max_count: cfg.max,
    _window_seconds: cfg.windowSeconds,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.allowed) {
    throw new RateLimitError(row?.retry_after_seconds ?? cfg.windowSeconds);
  }
  return { remaining: row.remaining as number };
}

function currentPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getOrCreateSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
) {
  const { data: existing, error: readError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (existing) return existing as { plan_id: PlanId; period_start: string };

  const { data: created, error: insertError } = await supabase
    .from("user_subscriptions")
    .insert({ user_id: userId, plan_id: "free", period_start: currentPeriodStart() })
    .select("*")
    .single();
  if (insertError) throw new Error(insertError.message);
  return created as { plan_id: PlanId; period_start: string };
}

export async function getUsageSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
) {
  const subscription = await getOrCreateSubscription(supabase, userId);
  const plan = PLAN_BY_ID[subscription.plan_id] ?? PLAN_BY_ID.free;
  const periodStart = subscription.period_start ?? currentPeriodStart();

  const { count: textUsed, error: textError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("type", "image")
    .gte("created_at", periodStart);
  if (textError) throw new Error(textError.message);

  const { count: imageUsed, error: imageError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "image")
    .gte("created_at", periodStart);
  if (imageError) throw new Error(imageError.message);

  return {
    plan,
    planId: plan.id,
    periodStart,
    textUsed: textUsed ?? 0,
    imageUsed: imageUsed ?? 0,
  };
}

export async function assertUsageAvailable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  kind: GenerationKind,
  requested = 1,
) {
  const usage = await getUsageSummary(supabase, userId);
  const limit = kind === "image" ? usage.plan.monthlyImages : usage.plan.monthlyGenerations;
  const used = kind === "image" ? usage.imageUsed : usage.textUsed;

  if (limit !== -1 && used + requested > limit) {
    throw new UsageLimitError(
      `You've reached your ${usage.plan.name} plan ${kind === "image" ? "AI image" : "text generation"} limit for this month.`,
    );
  }

  return usage;
}
