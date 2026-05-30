import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

export async function streamImage(
  endpoint: string,
  body: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Image generation failed (${res.status})`);
  }

  let sawCompleted = false;
  const parser = createParser({
    onEvent(event) {
      if (
        event.event !== "image_generation.partial_image" &&
        event.event !== "image_generation.completed"
      )
        return;
      let payload: { b64_json?: string };
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!payload.b64_json) return;
      const isFinal = event.event === "image_generation.completed";
      flushSync(() => {
        onFrame(`data:image/png;base64,${payload.b64_json}`, isFinal);
      });
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  if (!sawCompleted) throw new Error("Image stream ended without a completed event");
}
