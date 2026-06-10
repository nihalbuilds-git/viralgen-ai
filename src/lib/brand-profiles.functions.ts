import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BrandProfile = {
  id: string;
  user_id: string;
  name: string;
  voice: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const listBrandProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrandProfile[];
  });

const CreateInput = z.object({
  name: z.string().trim().min(1).max(80),
  voice: z.string().trim().max(2000).default(""),
  is_default: z.boolean().optional(),
});

export const createBrandProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.is_default) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("brand_profiles")
        .update({ is_default: false })
        .eq("user_id", userId);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("brand_profiles")
      .insert({
        user_id: userId,
        name: data.name,
        voice: data.voice,
        is_default: data.is_default ?? false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as BrandProfile;
  });

const UpdateInput = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80).optional(),
  voice: z.string().trim().max(2000).optional(),
  is_default: z.boolean().optional(),
});

export const updateBrandProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.is_default) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("brand_profiles")
        .update({ is_default: false })
        .eq("user_id", userId);
    }
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.voice !== undefined) patch.voice = data.voice;
    if (data.is_default !== undefined) patch.is_default = data.is_default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("brand_profiles")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as BrandProfile;
  });

const IdInput = z.object({ id: z.string().uuid() });

export const deleteBrandProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("brand_profiles")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Resolve effective brand voice for a user — given an optional profile id,
// fall back to default brand_profile, then to profiles.brand_voice.
export async function resolveBrandVoice(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  brandProfileId?: string | null,
): Promise<string> {
  if (brandProfileId) {
    const { data } = await supabase
      .from("brand_profiles")
      .select("voice")
      .eq("id", brandProfileId)
      .eq("user_id", userId)
      .maybeSingle();
    if (typeof data?.voice === "string" && data.voice.trim()) return data.voice;
  }
  const { data: def } = await supabase
    .from("brand_profiles")
    .select("voice")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  if (typeof def?.voice === "string" && def.voice.trim()) return def.voice;
  const { data: profile } = await supabase
    .from("profiles")
    .select("brand_voice")
    .eq("id", userId)
    .maybeSingle();
  return typeof profile?.brand_voice === "string" ? profile.brand_voice : "";
}
