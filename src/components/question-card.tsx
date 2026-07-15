import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Alternative {
  key: string; // "A".."E"
  text: string;
}

export interface QuestionCardData {
  id: string;
  statement: string;
  alternatives: Alternative[];
  exam_block: "gerais" | "especificos";
  question_weight: number;
  source_reference?: { banca?: string; ano?: number | string; prova?: string } | null;
  topic?: string;
  is_demo?: boolean;
}

export interface FeedbackData {
  is_correct: boolean;
  correct_key: string;
  explanation: string | null;
  next_due_at?: string;
}

export function QuestionCard({
  question,
  onSubmit,
  onNext,
  feedback,
  submitting,
  ttsEnabled = false,
  showConfidence = false,
}: {
  question: QuestionCardData;
  submitting: boolean;
  feedback: FeedbackData | null;
  onSubmit: (selectedKey: string, elapsedMs: number) => void;
  onNext: () => void;
  ttsEnabled?: boolean;
  showConfidence?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<"baixa" | "media" | "alta" | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const groupRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(null);
    setConfidence(null);
    startedAtRef.current = Date.now();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [question.id]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  useEffect(() => {
    if (feedback && feedbackRef.current) feedbackRef.current.focus();
  }, [feedback]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (feedback) return;
    const keys = question.alternatives.map((a) => a.key);
    if (/^[1-9]$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (idx < keys.length) {
        setSelected(keys[idx]);
        e.preventDefault();
      }
    }
    if (e.key === "Enter" && selected) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!selected || submitting || feedback) return;
    onSubmit(selected, Date.now() - startedAtRef.current);
  }

  function toggleSpeech() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const alternatives = question.alternatives
      .map((alternative) => `${alternative.key}. ${alternative.text}`)
      .join(". ");
    const utterance = new SpeechSynthesisUtterance(`${question.statement}. ${alternatives}`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  const blockLabel =
    question.exam_block === "gerais" ? "Conhecimentos Gerais" : "Conhecimentos Específicos";

  return (
    <article
      className="question-surface p-5 md:p-7"
      onKeyDown={handleKeyDown}
      aria-labelledby="q-statement"
    >
      <header className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="rounded-full border border-border/60 px-2 py-0.5">{blockLabel}</span>
        <span className="rounded-full border border-[var(--gold)]/40 px-2 py-0.5 text-[var(--gold)]">
          Peso {question.question_weight}
        </span>
        {question.source_reference?.banca && (
          <span className="rounded-full border border-border/60 px-2 py-0.5">
            {question.source_reference.banca}
            {question.source_reference.ano ? ` · ${question.source_reference.ano}` : ""}
          </span>
        )}
        {(ttsEnabled || speaking) && (
          <button
            type="button"
            onClick={toggleSpeech}
            aria-pressed={speaking}
            className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 normal-case tracking-normal hover:border-[var(--gold)]/60 hover:text-foreground"
          >
            {speaking ? (
              <VolumeX className="size-4" aria-hidden />
            ) : (
              <Volume2 className="size-4" aria-hidden />
            )}
            {speaking ? "Parar leitura" : "Ouvir questão"}
          </button>
        )}
      </header>

      {question.is_demo && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--gold)]/35 bg-[var(--gold)]/6 px-3 py-2 text-sm">
          <strong className="text-[var(--gold)]">Demonstração</strong>
          <span className="text-muted-foreground">
            Questão autoral para testar o fluxo. Não é conteúdo oficial da banca.
          </span>
        </div>
      )}

      {question.topic && <p className="mb-2 text-sm text-[var(--gold)]">{question.topic}</p>}

      <h2 id="q-statement" className="text-lg leading-relaxed md:text-xl">
        {question.statement}
      </h2>

      <fieldset className="mt-6" disabled={submitting || !!feedback}>
        <legend className="sr-only">Selecione uma alternativa</legend>
        <div ref={groupRef} role="radiogroup" aria-labelledby="q-statement" className="space-y-2">
          {question.alternatives.map((alt) => {
            const isSelected = selected === alt.key;
            const isCorrect = feedback && alt.key === feedback.correct_key;
            const isWrongPick = feedback && isSelected && !feedback.is_correct;
            return (
              <label
                key={alt.key}
                className={cn(
                  "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                  "border-border bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
                  isSelected && !feedback && "border-[var(--gold)] bg-[var(--surface-3)]",
                  isCorrect &&
                    "border-[var(--correct)] bg-[color-mix(in_oklch,var(--correct)_18%,transparent)]",
                  isWrongPick &&
                    "border-[var(--incorrect)] bg-[color-mix(in_oklch,var(--incorrect)_18%,transparent)]",
                )}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={alt.key}
                  checked={isSelected}
                  onChange={() => setSelected(alt.key)}
                  className="sr-only"
                  aria-describedby={`alt-${alt.key}`}
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border font-semibold",
                    isSelected
                      ? "border-[var(--gold)] text-[var(--gold)]"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {alt.key}
                </span>
                <span id={`alt-${alt.key}`} className="text-sm leading-relaxed md:text-base">
                  {alt.text}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {showConfidence && !feedback && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm text-muted-foreground">
            Confiança na resposta (opcional)
          </legend>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            {(
              [
                ["baixa", "Baixa"],
                ["media", "Média"],
                ["alta", "Alta"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={confidence === value}
                onClick={() => setConfidence(confidence === value ? null : value)}
                className={cn(
                  "min-h-11 min-w-24 border-r border-border px-4 text-sm last:border-r-0",
                  confidence === value
                    ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div ref={feedbackRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="mt-6">
        {feedback && (
          <div
            className={cn(
              "rounded-lg border p-4",
              feedback.is_correct
                ? "border-[var(--correct)]/60 bg-[color-mix(in_oklch,var(--correct)_10%,transparent)]"
                : "border-[var(--incorrect)]/60 bg-[color-mix(in_oklch,var(--incorrect)_10%,transparent)]",
            )}
          >
            <div className="flex items-center gap-2">
              {feedback.is_correct ? (
                <CheckCircle2 aria-hidden className="text-[var(--correct)]" />
              ) : (
                <XCircle aria-hidden className="text-[var(--incorrect)]" />
              )}
              <span className="font-semibold">
                {feedback.is_correct
                  ? "Resposta correta."
                  : `Resposta incorreta. Gabarito: ${feedback.correct_key}.`}
              </span>
            </div>
            {feedback.explanation && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {feedback.explanation}
              </p>
            )}
            {question.source_reference?.prova && (
              <p className="mt-3 text-xs text-muted-foreground">
                Fonte de estudo: {question.source_reference.prova}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Atalhos: 1–{question.alternatives.length} selecionam · Enter confirma.
        </p>
        {feedback ? (
          <Button variant="gold" size="lg" onClick={onNext}>
            Próxima questão
          </Button>
        ) : (
          <Button variant="gold" size="lg" onClick={submit} disabled={!selected || submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Enviando…
              </>
            ) : (
              "Responder"
            )}
          </Button>
        )}
      </div>
    </article>
  );
}
