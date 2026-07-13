import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { getNextQuestion } from "@/lib/questions.functions";
import { submitAttempt } from "@/lib/attempts.functions";
import { startSession } from "@/lib/sessions.functions";
import { recordCheckin } from "@/lib/checkpoints.functions";
import { getPreferences } from "@/lib/preferences.functions";
import { QuestionCard, type QuestionCardData, type FeedbackData } from "@/components/question-card";
import { CheckpointDialog } from "@/components/checkpoint-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/treino")({
  head: () => ({
    meta: [{ title: "Treino — TCE-MA 2026" }, { name: "robots", content: "noindex" }],
  }),
  component: TreinoPage,
});

type Mode = "geral" | "foco" | "revisao";

function normalizeAlternatives(raw: unknown): { key: string; text: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r, i) => {
      if (typeof r === "string") return { key: String.fromCharCode(65 + i), text: r };
      if (r && typeof r === "object") {
        const obj = r as Record<string, unknown>;
        return {
          key: String((obj.key ?? obj.letter ?? String.fromCharCode(65 + i)) as string),
          text: String((obj.text ?? obj.value ?? "") as string),
        };
      }
      return null;
    })
    .filter((x): x is { key: string; text: string } => !!x);
}

function TreinoPage() {
  const [mode, setMode] = useState<Mode>("geral");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionCardData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const clientAttemptId = useRef<string>("");
  const [preferredPositionId, setPreferredPositionId] = useState<string | null>(null);

  const fetchNext = useServerFn(getNextQuestion);
  const startSess = useServerFn(startSession);
  const submitFn = useServerFn(submitAttempt);
  const recordCp = useServerFn(recordCheckin);
  const getPrefs = useServerFn(getPreferences);

  const loadNext = useCallback(
    async (m: Mode, excludeIds: string[]) => {
      setLoading(true);
      setFeedback(null);
      try {
        const q = await fetchNext({
          data: { mode: m, positionId: preferredPositionId ?? undefined, excludeIds },
        });
        if (!q) {
          setQuestion(null);
        } else {
          clientAttemptId.current = crypto.randomUUID();
          setQuestion({
            id: q.id,
            statement: q.statement,
            alternatives: normalizeAlternatives(q.alternatives),
            exam_block: q.exam_block as "gerais" | "especificos",
            question_weight: Number(q.question_weight ?? 1),
            source_reference: (q.source_reference as QuestionCardData["source_reference"]) ?? null,
          });
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Não foi possível carregar a próxima questão.");
      } finally {
        setLoading(false);
      }
    },
    [fetchNext, preferredPositionId],
  );

  useEffect(() => {
    (async () => {
      try {
        const prefs = await getPrefs();
        setPreferredPositionId(prefs.preferred_position_id ?? null);
        const s = await startSess({ data: { mode: "geral", position_id: prefs.preferred_position_id ?? null } });
        setSessionId(s.id);
      } catch {}
      await loadNext("geral", []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    async (selectedKey: string, elapsedMs: number) => {
      if (!question || submitting || feedback) return;
      setSubmitting(true);
      try {
        const res = await submitFn({
          data: {
            client_attempt_id: clientAttemptId.current,
            question_id: question.id,
            session_id: sessionId,
            mode,
            selected_key: selectedKey,
            response_time_ms: Math.min(elapsedMs, 1_800_000),
            confidence: null,
          },
        });
        setFeedback({
          is_correct: res.is_correct,
          correct_key: res.correct_key,
          explanation: res.explanation,
          next_due_at: res.next_due_at,
        });
        if (!res.idempotent) {
          setAnsweredCount((n) => {
            const next = n + 1;
            if (next > 0 && next % 5 === 0) setCheckpointOpen(true);
            return next;
          });
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha ao registrar resposta.");
      } finally {
        setSubmitting(false);
      }
    },
    [question, submitting, feedback, submitFn, sessionId, mode],
  );

  const handleNext = useCallback(() => {
    loadNext(mode, question ? [question.id] : []);
  }, [loadNext, mode, question]);

  async function handleCheckin(a: { kind: string; value: string }) {
    setCheckpointOpen(false);
    try {
      await recordCp({
        data: {
          session_id: sessionId,
          question_index: answeredCount,
          kind: a.kind,
          payload: { value: a.value },
        },
      });
    } catch {}
  }

  function handleSkipCheckin() {
    setCheckpointOpen(false);
    recordCp({
      data: {
        session_id: sessionId,
        question_index: answeredCount,
        kind: "skipped",
        payload: {},
      },
    }).catch(() => {});
  }

  const modeChips = useMemo(
    () => [
      { v: "geral" as const, label: "Treino geral" },
      { v: "foco" as const, label: "Foco TCE-MA" },
      { v: "revisao" as const, label: "Revisão de erros" },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <section aria-labelledby="modos" className="mb-6 flex flex-wrap items-center gap-2">
        <h1 id="modos" className="mr-3 font-display text-xl font-semibold">
          Treino
        </h1>
        {modeChips.map((c) => (
          <button
            key={c.v}
            onClick={() => {
              setMode(c.v);
              loadNext(c.v, []);
            }}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (mode === c.v
                ? "border-[var(--gold)] bg-[color-mix(in_oklch,var(--gold)_18%,transparent)] text-[var(--gold)]"
                : "border-border text-muted-foreground hover:bg-accent")
            }
            aria-pressed={mode === c.v}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          Respondidas: <span className="font-semibold text-foreground">{answeredCount}</span>
        </span>
      </section>

      {loading && (
        <div className="surface-panel mx-auto max-w-3xl p-8 text-center text-muted-foreground">
          Carregando questão…
        </div>
      )}

      {!loading && !question && (
        <div className="surface-panel mx-auto max-w-3xl p-8 text-center">
          <h2 className="font-display text-lg font-semibold">Nenhuma questão publicada ainda</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O banco está pronto para receber conteúdo autorizado. Assim que a curadoria publicar
            questões, elas aparecerão aqui automaticamente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/preferencias">Ajustar preferências</Link>
            </Button>
            <Button variant="ghost-gold" onClick={() => loadNext(mode, [])}>
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {!loading && question && (
        <QuestionCard
          question={question}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          submitting={submitting}
        />
      )}

      <CheckpointDialog
        open={checkpointOpen}
        onOpenChange={setCheckpointOpen}
        questionIndex={answeredCount}
        onAnswer={handleCheckin}
        onSkip={handleSkipCheckin}
      />
    </div>
  );
}
