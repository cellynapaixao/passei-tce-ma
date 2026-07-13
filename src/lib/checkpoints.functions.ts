import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  session_id: z.string().uuid().nullable(),
  question_index: z.number().int().nonnegative(),
  kind: z.string().max(64),
  payload: z.record(z.string(), z.any()).default({}),
});

export const recordCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => schema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("study_profile_checkins").insert({
      user_id: userId,
      session_id: data.session_id,
      question_index: data.question_index,
      kind: data.kind,
      payload: data.payload,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
