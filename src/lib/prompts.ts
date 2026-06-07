// Shared prompt builders used by both server-side generators and the
// client-side "Preview prompt" toggle so users can see exactly what the
// model receives — including their brand voice.

export type CaptionVars = {
  platform: string;
  product: string;
  tone: string;
  audience: string;
};

export type AdCopyVars = {
  product: string;
  audience: string;
  offer: string;
  tone: string;
};

export type ProductVars = {
  name: string;
  features: string;
  audience: string;
};

export type PromptPair = { system: string; user: string };

function brandVoiceSuffix(brandVoice?: string | null) {
  const voice = (brandVoice ?? "").trim();
  return voice ? `\nBrand voice to follow: ${voice}` : "";
}

export function buildCaptionPrompt(vars: CaptionVars, brandVoice?: string | null): PromptPair {
  return {
    system: `You are an expert social media copywriter. Always reply with valid JSON matching the requested schema. No commentary.${brandVoiceSuffix(brandVoice)}`,
    user: `Generate 3 scroll-stopping ${vars.platform} captions promoting "${vars.product}" for the audience: ${vars.audience}. Tone: ${vars.tone}. Include relevant emojis and 3-6 hashtags per caption.

Respond as JSON: { "captions": ["caption 1", "caption 2", "caption 3"] }`,
  };
}

export function buildAdCopyPrompt(vars: AdCopyVars, brandVoice?: string | null): PromptPair {
  return {
    system: `You are a senior performance-marketing copywriter. Respond ONLY with valid JSON. No commentary.${brandVoiceSuffix(brandVoice)}`,
    user: `Write high-converting ad copy.
Product: ${vars.product}
Audience: ${vars.audience}
Offer: ${vars.offer}
Tone: ${vars.tone}

Constraints: headline <= 40 chars, primary text 2-3 sentences, CTA 2-4 words.
Respond as JSON: { "headline": "...", "primaryText": "...", "cta": "..." }`,
  };
}

export function buildProductPrompt(vars: ProductVars, brandVoice?: string | null): PromptPair {
  return {
    system: `You are an expert SEO product copywriter. Respond ONLY with valid JSON. No commentary.${brandVoiceSuffix(brandVoice)}`,
    user: `Write a single SEO-friendly product description (120-180 words) for "${vars.name}". Target audience: ${vars.audience}. Key features: ${vars.features}.
Include natural keyword usage, benefit-led language, and a closing line that invites action.

Respond as JSON: { "description": "..." }`,
  };
}
