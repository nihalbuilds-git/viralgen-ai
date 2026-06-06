import { PLAN_BY_ID, type PlanId } from "./plans";

export const USAGE_LIMIT_CODE = "USAGE_LIMIT_REACHED";

export type GenerationKind = "text" | "image";

export class UsageLimitError extends Error {
  code = USAGE_LIMIT_CODE;
  status = 402;

  constructor(message: string) {
    super(`${USAGE_LIMIT_CODE}: ${message}`);
    this.name = "UsageLimitError";
  }
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
