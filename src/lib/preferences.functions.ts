import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  font_scale: z.number().int().min(80).max(200).optional(),
  high_contrast: z.boolean().optional(),
  reduce_motion: z.boolean().optional(),
  tts_enabled: z.boolean().optional(),
  preferred_position_id: z.string().uuid().nullable().optional(),
});

export const getPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (
      data ?? {
        user_id: userId,
        font_scale: 100,
        high_contrast: false,
        reduce_motion: false,
        tts_enabled: false,
        preferred_position_id: null,
      }
    );
  });

export const updatePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => schema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
