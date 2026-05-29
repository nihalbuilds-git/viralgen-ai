import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TypeEnum = z.enum(["caption", "adcopy", "product", "image"]);

const SaveInput = z.object({
  type: TypeEnum,
  title: z.string().min(1).max(200),
  input: z.record(z.string(), z.unknown()).default({}),
  output: z.record(z.string(), z.unknown()).default({}),
});

export const saveGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        input: data.input as never,
        output: data.output as never,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const ListInput = z.object({
  type: TypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const listGenerations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.type) q = q.eq("type", data.type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const IdInput = z.object({ id: z.string().uuid() });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("generation_id", data.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, generation_id: data.id });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorites")
      .select("id, created_at, generation:generations(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
