// Server-only helper for calling Lovable AI Gateway via fetch.
// LOVABLE_API_KEY is auto-provisioned and must never reach the client.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callLovableAI(opts: {
  messages: ChatMessage[];
  model?: string;
  responseFormat?: "json_object" | "text";
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: opts.model ?? "google/gemini-3-flash-preview",
    messages: opts.messages,
    temperature: opts.temperature ?? 0.8,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Log full upstream details server-side, return a generic message to the client.
    console.error("[ai-gateway]", res.status, text.slice(0, 500));
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace → Usage.");
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI model");
  return content;
}

export async function callLovableAIJson<T>(opts: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}): Promise<T> {
  const raw = await callLovableAI({ ...opts, responseFormat: "json_object" });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try to extract JSON from a code fence or surrounding prose.
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Model did not return valid JSON");
  }
}
