import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TrackInput = z.object({
  event: z.string().trim().min(1).max(80),
  properties: z.record(z.string(), z.unknown()).optional(),
});

// Authenticated funnel-event tracker. Records signup → first generation →
// upgrade click etc. for business-side analytics.
export const trackEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TrackInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("analytics_events").insert({
      user_id: userId,
      event: data.event,
      properties: (data.properties ?? {}) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
