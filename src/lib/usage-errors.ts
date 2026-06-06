import { USAGE_LIMIT_CODE } from "./usage.server";

export function getUsageLimitMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message.includes(USAGE_LIMIT_CODE)) return null;
  return message.replace(`${USAGE_LIMIT_CODE}:`, "").trim() || "You've reached your plan limit for this month.";
}