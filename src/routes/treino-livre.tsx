import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowLeftRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  RotateCcw,
  Target,
  Weight,
} from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { QuestionCard, type FeedbackData } from "@/components/question-card";
import { CheckpointDialog } from "@/components/checkpoint-dialog";
import { Button } from "@/components/ui/button";
import { EXAM_POSITIONS, formatExamDate, getPosition } from "@/data/exam-catalog";
import { getDemoSession } from "@/data/demo-questions";
import type { AccessibilityPreferences } from "@/lib/accessibility-preferences";

const searchSchema = z.object({ cargo: z.string().optional() });

export const Route = createFileRoute("/treino-livre")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Treino livre — Passei! TCE-MA" },
      {
        name: "description",
        content:
          "Teste o fluxo de questões para qualquer um dos 16 cargos do TCE-MA 2026, sem cadastro obrigatório.",
      },
    ],
  }),
  component: FreePracticePage,
});

function FreePracticePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const position = getPosition(search.cargo);
  const questions = useMemo(() => getDemoSession(position.code), [position.code]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    setQuestionIndex(0);
    setFeedback(null);
    setCorrectCount(0);
    setComplete(false);
  }, [position.code]);

  const question = questions[questionIndex];

  function choosePosition(code: string) {
    navigate({ to: "/treino-livre", search: { cargo: code }, replace: true });
  }

  function handleSubmit(selectedKey: string) {
    if (feedback) return;
    const isCorrect = selectedKey === question.correctKey;
    setFeedback({
      is_correct: isCorrect,
      correct_key: question.correctKey,
      explanation: question.explanation,
    });
    if (isCorrect) setCorrectCount((count) => count + 1);

    const stored = {
      positionCode: position.code,
      questionId: question.id,
      selectedKey,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };
    try {
      const parsed = JSON.parse(localStorage.getItem("passei-guest-attempts") ?? "[]");
      const previous = Array.isArray(parsed) ? parsed : [];
      localStorage.setItem(
        "passei-guest-attempts",
        JSON.stringify([...previous.slice(-49), stored]),
      );
    } catch {
      // O treino continua mesmo quando o navegador bloqueia armazenamento local.
    }
  }

  function handleNext() {
    setFeedback(null);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    setComplete(true);
    setCheckpointOpen(true);
  }

  function restart() {
    setQuestionIndex(0);
    setFeedback(null);
    setCorrectCount(0);
    setComplete(false);
  }

  const handleAccessibilityChange = useCallback((preferences: AccessibilityPreferences) => {
    setTtsEnabled(preferences.tts_enabled);
  }, []);

  const progress = complete ? 100 : ((questionIndex + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-dvh bg-background">
      <PublicHeader onAccessibilityChange={handleAccessibilityChange} />

      <div className="border-b border-border/60 bg-[var(--surface-1)]/70">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="flex min-w-0 items-center gap-3">
            <span className="sr-only">Cargo ou especialidade</span>
            <select
              value={position.code}
              onChange={(event) => choosePosition(event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-md border border-border bg-[var(--surface-2)] px-3 text-sm font-medium text-foreground lg:max-w-2xl"
            >
              {EXAM_POSITIONS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeftRight className="size-4 text-[var(--gold)]" aria-hidden /> Troque quando
              quiser
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-[var(--gold)]" aria-hidden />{" "}
              {formatExamDate(position.examDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm sm:px-6">
          <strong>
            {complete ? "Sessão concluída" : `Questão ${questionIndex + 1} de ${questions.length}`}
          </strong>
          {!complete && (
            <>
              <span className="text-muted-foreground">
                {question.exam_block === "gerais"
                  ? "Conhecimentos gerais"
                  : "Conhecimentos específicos"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Weight className="size-4" aria-hidden /> Peso {question.question_weight}
              </span>
            </>
          )}
          <div
            className="h-1.5 min-w-40 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Progresso da sessão"
          >
            <div
              className="h-full rounded-full bg-[var(--gold)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main id="conteudo-principal" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {complete ? (
          <SessionSummary
            correctCount={correctCount}
            total={questions.length}
            positionName={position.fullName}
            onRestart={restart}
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <QuestionCard
              question={{ ...question, is_demo: true, topic: question.topic }}
              feedback={feedback}
              submitting={false}
              onSubmit={handleSubmit}
              onNext={handleNext}
              ttsEnabled={ttsEnabled}
              showConfidence
            />
            <SessionPlan positionName={position.fullName} eligibility={position.eligibility} />
          </div>
        )}
      </main>

      <CheckpointDialog
        open={checkpointOpen}
        onOpenChange={setCheckpointOpen}
        questionIndex={5}
        onAnswer={(answer) => {
          try {
            localStorage.setItem("passei-last-checkpoint", JSON.stringify(answer));
          } catch {
            // O checkpoint continua opcional quando o armazenamento local está indisponível.
          }
          setCheckpointOpen(false);
        }}
        onSkip={() => setCheckpointOpen(false)}
      />
    </div>
  );
}

function SessionPlan({ positionName, eligibility }: { positionName: string; eligibility: string }) {
  return (
    <aside className="session-rail lg:sticky lg:top-24" aria-labelledby="session-plan-title">
      <h2 id="session-plan-title" className="font-display text-xl font-semibold text-[var(--gold)]">
        Plano desta sessão
      </h2>
      <div className="mt-5 grid gap-4 text-sm">
        <p className="flex items-center gap-3">
          <ListChecks className="size-5 text-[var(--gold)]" aria-hidden /> 5 questões
        </p>
        <p className="flex items-center gap-3">
          <Clock3 className="size-5 text-[var(--gold)]" aria-hidden /> Cerca de 8 minutos
        </p>
        <p className="flex items-start gap-3">
          <Target className="mt-0.5 size-5 shrink-0 text-[var(--gold)]" aria-hidden />{" "}
          <span>{positionName}</span>
        </p>
      </div>

      <div className="my-6 h-px bg-border" />

      <h3 className="font-display font-semibold">Quem pode concorrer</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{eligibility}</p>

      <h3 className="mt-6 font-display font-semibold">Objetivos do bloco</h3>
      <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" aria-hidden /> Testar
          uma questão específica do cargo.
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" aria-hidden /> Revisar
          quatro pontos de conhecimentos gerais.
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" aria-hidden />{" "}
          Identificar o próximo foco de estudo.
        </li>
      </ul>

      <Button asChild variant="outline" size="lg" className="mt-7 w-full">
        <Link to="/auth" search={{ mode: "signup" }}>
          <Bookmark aria-hidden /> Salvar progresso
        </Link>
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        O treino livre funciona sem cadastro. A conta sincroniza progresso e revisões.
      </p>
    </aside>
  );
}

function SessionSummary({
  correctCount,
  total,
  positionName,
  onRestart,
}: {
  correctCount: number;
  total: number;
  positionName: string;
  onRestart: () => void;
}) {
  const percent = Math.round((correctCount / total) * 100);
  return (
    <section className="mx-auto max-w-4xl py-8 text-center" aria-labelledby="summary-title">
      <span className="mx-auto grid size-16 place-items-center rounded-full border border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold)]">
        <CheckCircle2 className="size-8" aria-hidden />
      </span>
      <h1 id="summary-title" className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
        Seu primeiro diagnóstico está pronto.
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        Você testou o fluxo para {positionName}. O resultado é local e serve para orientar a próxima
        sessão.
      </p>

      <div className="mt-8 grid overflow-hidden rounded-xl border border-border sm:grid-cols-3">
        <div className="p-5">
          <strong className="block text-3xl text-[var(--gold)]">
            {correctCount}/{total}
          </strong>
          <span className="text-sm text-muted-foreground">acertos</span>
        </div>
        <div className="border-y border-border p-5 sm:border-x sm:border-y-0">
          <strong className="block text-3xl">{percent}%</strong>
          <span className="text-sm text-muted-foreground">aproveitamento</span>
        </div>
        <div className="p-5">
          <strong className="block text-3xl">5</strong>
          <span className="text-sm text-muted-foreground">questões concluídas</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" variant="gold" onClick={onRestart}>
          <RotateCcw aria-hidden /> Refazer este bloco
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/" hash="cargos">
            Escolher outro cargo
          </Link>
        </Button>
        <Button size="lg" variant="ghost-gold" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Criar conta e continuar
          </Link>
        </Button>
      </div>
    </section>
  );
}
