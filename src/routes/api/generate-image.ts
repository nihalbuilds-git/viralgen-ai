import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { assertUsageAvailable } from "@/lib/usage.server";
import type { Database } from "@/integrations/supabase/types";

const ImageRequest = z.object({
  prompt: z.string().trim().min(1).max(2000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024"),
});

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        const supabaseUrl = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!supabaseUrl || !publishableKey) return new Response("Backend is not configured", { status: 500 });

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return new Response("Please sign in to generate images", { status: 401 });

        const token = authHeader.replace("Bearer ", "");
        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claimsData?.claims?.sub;
        if (claimsError || !userId) return new Response("Please sign in to generate images", { status: 401 });

        const parsed = ImageRequest.safeParse(await request.json());
        if (!parsed.success) return new Response("Prompt required", { status: 400 });

        try {
          await assertUsageAvailable(supabase, userId, "image");
        } catch (error) {
          return new Response(error instanceof Error ? error.message : "Usage limit reached", { status: 402 });
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("brand_voice")
          .eq("id", userId)
          .maybeSingle();
        const brandVoice = profile?.brand_voice ? ` Brand voice: ${profile.brand_voice}` : "";
        const prompt = `${parsed.data.prompt}${brandVoice}`;

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/images/generations",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-image-2",
              prompt,
              size: parsed.data.size,
              quality: "low",
              stream: true,
              partial_images: 1,
            }),
            signal: request.signal,
          },
        );

        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text(), { status: upstream.status });
        }

        const stream = upstream.body.pipeThrough(new TextDecoderStream()).pipeThrough(
          new TransformStream<string, Uint8Array>({
            async transform(chunk, controller) {
              controller.enqueue(new TextEncoder().encode(chunk));
              const match = chunk.match(/event: image_generation\.completed[\s\S]*?data: (\{[^\n]+\})/);
              if (!match) return;
              try {
                const payload = JSON.parse(match[1]) as { b64_json?: string };
                if (!payload.b64_json) return;
                const path = `${userId}/${crypto.randomUUID()}.png`;
                const bytes = Uint8Array.from(atob(payload.b64_json), (char) => char.charCodeAt(0));
                const { error: uploadError } = await supabase.storage
                  .from("generated-images")
                  .upload(path, bytes, { contentType: "image/png", upsert: false });
                if (uploadError) throw uploadError;

                const { error: insertError } = await supabase.from("generations").insert({
                  user_id: userId,
                  type: "image",
                  title: `Image · ${parsed.data.prompt.slice(0, 80)}`,
                  input: parsed.data,
                  output: { imagePath: path, prompt: parsed.data.prompt, size: parsed.data.size },
                });
                if (insertError) throw insertError;
              } catch (error) {
                console.error("Failed to persist generated image", error);
              }
            },
          }),
        );

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
