const USAGE_LIMIT_CODE = "USAGE_LIMIT_REACHED";
const RATE_LIMIT_CODE = "RATE_LIMIT_EXCEEDED";

export function getUsageLimitMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message.includes(USAGE_LIMIT_CODE)) return null;
  return (
    message.replace(`${USAGE_LIMIT_CODE}:`, "").trim() ||
    "You've reached your plan limit for this month."
  );
}

export function getRateLimitMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message.includes(RATE_LIMIT_CODE)) return null;
  return (
    message.replace(`${RATE_LIMIT_CODE}:`, "").trim() ||
    "You're generating too quickly. Please slow down and try again in a moment."
  );
}
