import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IdInput = z.object({ id: z.string().uuid() });

export const toggleGenerationPublic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error: readError } = await (supabase as any)
      .from("generations")
      .select("is_public")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("Generation not found");
    const next = !row.is_public;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("generations")
      .update({ is_public: next })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { isPublic: next };
  });

export const getGenerationShareStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("generations")
      .select("is_public")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { isPublic: Boolean(row?.is_public) };
  });

// Public read: anyone can fetch a generation iff is_public=true. Uses
// service role to bypass RLS, but explicitly filters on is_public.
export const getPublicGeneration = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabaseAdmin as any)
      .from("generations")
      .select("id, type, title, output, created_at, is_public")
      .eq("id", data.id)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    // Sign image URL if it's an image generation
    const output = row.output as Record<string, unknown> | null;
    if (row.type === "image" && typeof output?.imagePath === "string") {
      const { data: signed } = await supabaseAdmin.storage
        .from("generated-images")
        .createSignedUrl(output.imagePath, 60 * 60 * 24);
      row.output = { ...output, imageUrl: signed?.signedUrl ?? null };
    }
    return row;
  });
