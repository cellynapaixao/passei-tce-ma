import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from("srs_states")
      .select("question_id, due_at, last_grade, repetitions")
      .eq("user_id", userId)
      .lte("due_at", nowIso)
      .order("due_at", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);
    return due ?? [];
  });
