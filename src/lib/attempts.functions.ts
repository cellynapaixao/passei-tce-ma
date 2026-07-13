import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  client_attempt_id: z.string().uuid(),
  question_id: z.string().uuid(),
  session_id: z.string().uuid().nullable(),
  mode: z.enum(["geral", "foco", "revisao", "diagnostico"]).default("geral"),
  selected_key: z.string().max(8).nullable(),
  response_time_ms: z.number().int().nonnegative().max(1_800_000).nullable(),
  confidence: z.number().int().min(0).max(5).nullable().optional(),
});

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => schema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rpc, error } = await supabase.rpc("submit_attempt", {
      p_client_attempt_id: data.client_attempt_id,
      p_question_id: data.question_id,
      p_session_id: data.session_id,
      p_mode: data.mode,
      p_selected_key: data.selected_key,
      p_response_time_ms: data.response_time_ms,
      p_confidence: data.confidence ?? null,
    });
    if (error) throw new Error(error.message);
    return rpc as {
      attempt_id: string;
      is_correct: boolean;
      correct_key: string;
      explanation: string | null;
      next_due_at?: string;
      idempotent: boolean;
    };
  });
