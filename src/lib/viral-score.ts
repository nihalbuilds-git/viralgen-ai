// Deterministic content-quality heuristic. Not a real ML model — but based on
// real signals in the copy (hook words, CTAs, hashtags, length, questions,
// emojis), not a hash of the title. Persisted at generation time so the number
// is stable and comparable across the app.

const HOOK_WORDS = [
  "you",
  "your",
  "why",
  "how",
  "stop",
  "secret",
  "never",
  "finally",
  "imagine",
  "warning",
  "proven",
  "instantly",
  "guaranteed",
  "free",
  "new",
];
const CTA_WORDS = [
  "buy",
  "shop",
  "try",
  "get",
  "join",
  "start",
  "learn",
  "download",
  "subscribe",
  "sign up",
  "click",
  "grab",
  "book",
  "reserve",
  "order",
];
const POWER_EMOJIS = /[✨🔥💥🚀⚡️🎯💎🎉👉❤️]/u;

export function computeViralScore(text: string): number {
  const t = (text ?? "").trim();
  if (!t) return 40;
  const lower = t.toLowerCase();

  let score = 45;

  // Length sweet-spot: 60–220 chars gets a boost, way too long/short penalised.
  const len = t.length;
  if (len >= 60 && len <= 220) score += 10;
  else if (len > 220 && len <= 600) score += 4;
  else if (len < 30) score -= 8;

  // Hooks in the first ~60 chars matter more than later.
  const opening = lower.slice(0, 80);
  for (const word of HOOK_WORDS) {
    if (opening.includes(word)) {
      score += 3;
      break;
    }
  }

  const hookHits = HOOK_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
  score += Math.min(hookHits * 2, 10);

  // A CTA is worth real points.
  if (CTA_WORDS.some((w) => lower.includes(w))) score += 8;

  // Hashtags: 1–5 is ideal, more looks spammy.
  const hashtags = (t.match(/#\w+/g) ?? []).length;
  if (hashtags >= 1 && hashtags <= 5) score += 6;
  else if (hashtags > 5 && hashtags <= 10) score += 2;
  else if (hashtags > 10) score -= 4;

  // Questions engage.
  if (/\?/.test(t)) score += 3;

  // A power emoji or two helps.
  if (POWER_EMOJIS.test(t)) score += 3;

  // All-caps SHOUTING penalty (basic).
  const capsWords = (t.match(/\b[A-Z]{4,}\b/g) ?? []).length;
  if (capsWords >= 3) score -= 4;

  return Math.max(20, Math.min(99, Math.round(score)));
}
