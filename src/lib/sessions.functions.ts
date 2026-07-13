import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const startSchema = z.object({
  mode: z.enum(["geral", "foco", "revisao", "diagnostico"]).default("geral"),
  position_id: z.string().uuid().nullable().optional(),
});

export const startSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => startSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("study_sessions")
      .insert({ user_id: userId, mode: data.mode, position_id: data.position_id ?? null })
      .select("id, mode, position_id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const endSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ session_id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("study_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", data.session_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
