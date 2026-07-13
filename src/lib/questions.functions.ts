import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const nextSchema = z.object({
  mode: z.enum(["geral", "foco", "revisao", "diagnostico"]).default("geral"),
  positionId: z.string().uuid().optional(),
  excludeIds: z.array(z.string().uuid()).default([]),
});

/**
 * Seleção adaptativa v1:
 * 1) SRS vencido (mais antigo primeiro)
 * 2) Recomendações de revisão pendentes
 * 3) Se positionId: questões aderentes ao cargo
 * 4) Fallback: questão publicada aleatória
 * Sempre retorna null quando não há conteúdo (estado vazio honesto).
 */
export const getNextQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => nextSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const nowIso = new Date().toISOString();

    if (data.mode === "revisao") {
      const { data: due } = await supabase
        .from("srs_states")
        .select("question_id, due_at")
        .eq("user_id", userId)
        .lte("due_at", nowIso)
        .order("due_at", { ascending: true })
        .limit(20);
      const ids = (due ?? []).map((r) => r.question_id).filter((id) => !data.excludeIds.includes(id));
      if (ids.length > 0) {
        const { data: q } = await supabase
          .from("questions")
          .select("id, statement, alternatives, question_type, exam_block, question_weight, source_reference")
          .in("id", ids)
          .eq("review_status", "published")
          .limit(1)
          .maybeSingle();
        if (q) return q;
      }
      return null;
    }

    let query = supabase
      .from("questions")
      .select("id, statement, alternatives, question_type, exam_block, question_weight, source_reference")
      .eq("review_status", "published");
    if (data.excludeIds.length > 0) query = query.not("id", "in", `(${data.excludeIds.join(",")})`);

    if (data.positionId) {
      const { data: matched } = await supabase
        .from("question_position_matches")
        .select("question_id")
        .eq("position_id", data.positionId)
        .limit(50);
      const ids = (matched ?? []).map((m) => m.question_id);
      if (ids.length > 0) query = query.in("id", ids);
    }

    const { data: rows, error } = await query.limit(30);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return null;
    const pick = rows[Math.floor(Math.random() * rows.length)];
    return pick;
  });
