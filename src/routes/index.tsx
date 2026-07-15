import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Crosshair,
  ExternalLink,
  GraduationCap,
  ListChecks,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import {
  EXAM_POSITIONS,
  OFFICIAL_NOTICE_URL,
  POSITION_GROUPS,
  formatExamDate,
  getPosition,
  type PositionGroup,
} from "@/data/exam-catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Passei! TCE-MA — Treino orientado pelo edital 2026" },
      {
        name: "description",
        content:
          "Escolha entre os 16 cargos do TCE-MA 2026 e teste gratuitamente um treino de questões orientado pelo edital.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [selectedCode, setSelectedCode] = useState("auditor-controle-externo");
  const selected = getPosition(selectedCode);

  return (
    <div className="min-h-dvh bg-background">
      <PublicHeader />
      <main id="conteudo-principal">
        <section className="home-hero">
          <div className="territory-field" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-16">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.45rem]">
                Seu próximo acerto começa pela escolha certa.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Escolha seu cargo e inicie um treino livre com questões objetivas orientadas pelo
                edital do TCE-MA 2026.
              </p>
              <div className="mt-7 hidden flex-wrap gap-3 sm:flex">
                <Button asChild variant="gold" size="lg">
                  <Link to="/treino-livre" search={{ cargo: selected.code }}>
                    Começar treino livre <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <a
                  href={OFFICIAL_NOTICE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  Conferir edital oficial <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
              <dl className="mt-9 hidden max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-border/60 pt-5 text-sm sm:grid">
                <div>
                  <dt className="text-muted-foreground">Cargo selecionado</dt>
                  <dd className="mt-1 font-medium text-[var(--gold)]">{selected.specialty}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Data da prova</dt>
                  <dd className="mt-1 font-medium">{formatExamDate(selected.examDate)}</dd>
                </div>
              </dl>
            </div>

            <CargoSelector selectedCode={selectedCode} onSelect={setSelectedCode} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="preparacao-title">
          <div className="metric-rail">
            <div>
              <p
                id="preparacao-title"
                className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--gold)]"
              >
                Sua preparação em foco
              </p>
              <strong className="mt-2 block font-display text-2xl">100 questões objetivas</strong>
              <span className="text-sm text-muted-foreground">Formato definido no edital</span>
            </div>
            <Metric icon={<BookOpenCheck />} value="40" label="Conhecimentos gerais" />
            <Metric icon={<Crosshair />} value="60" label="Específicas · peso 2" />
            <div className="min-w-0">
              <span className="flex items-center gap-2 text-sm text-[var(--gold)]">
                <CalendarDays className="size-5" aria-hidden /> Datas oficiais
              </span>
              <div className="mt-2 flex gap-5">
                <span>
                  <strong className="block text-2xl">22</strong>
                  <small className="text-muted-foreground">nov · Analista</small>
                </span>
                <span>
                  <strong className="block text-2xl">29</strong>
                  <small className="text-muted-foreground">nov · Auditor e Técnico</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6" aria-labelledby="paths-title">
          <div className="study-paths">
            <p
              id="paths-title"
              className="col-span-full text-xs font-semibold uppercase tracking-[0.15em] text-[var(--gold)]"
            >
              Caminhos de estudo
            </p>
            <StudyPath
              icon={<ListChecks />}
              title="Treino geral"
              text="Quatro pontos comuns do edital para medir sua base."
            />
            <StudyPath
              icon={<UserRound />}
              title="Foco no seu cargo"
              text="Uma questão específica adaptada à especialidade escolhida."
            />
            <StudyPath
              icon={<BrainCircuit />}
              title="Revisão inteligente"
              text="Erros e acertos frágeis voltam quando a conta estiver ativa."
            />
          </div>
        </section>

        <section
          id="cargos"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16"
          aria-labelledby="all-positions-title"
        >
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <h2 id="all-positions-title" className="font-display text-3xl font-semibold">
                As 16 formações do certame, sem atalhos.
              </h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                A lista segue o Edital nº 1, publicado em 6 de julho de 2026. Requisitos e datas
                permanecem visíveis antes do treino.
              </p>
              <div className="mt-6 flex gap-5 text-sm">
                <span>
                  <strong className="block text-xl text-[var(--gold)]">15</strong>nível superior
                </span>
                <span>
                  <strong className="block text-xl text-[var(--gold)]">1</strong>nível médio
                </span>
                <span>
                  <strong className="block text-xl text-[var(--gold)]">16</strong>cargos
                </span>
              </div>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-[var(--surface-1)]">
              {EXAM_POSITIONS.map((position) => (
                <Link
                  key={position.code}
                  to="/treino-livre"
                  search={{ cargo: position.code }}
                  className="group grid min-h-14 gap-1 px-4 py-3 hover:bg-accent sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3"
                >
                  <span className="text-sm font-semibold text-[var(--gold)]">
                    {String(position.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-medium">{position.fullName}</strong>
                    <small className="text-muted-foreground">{position.eligibility}</small>
                  </span>
                  <ArrowRight
                    className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[var(--gold)] sm:block"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-[var(--surface-1)]/55">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Comece sem cadastro. Salve quando fizer sentido.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Cinco questões, feedback imediato e escolha livre de cargo.
              </p>
            </div>
            <Button asChild variant="gold" size="lg">
              <Link to="/treino-livre" search={{ cargo: selected.code }}>
                Iniciar agora <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Passei! TCE-MA · Produto independente de preparação.</span>
        <span>Questões demonstrativas autorais. Conteúdo oficial sujeito à curadoria.</span>
      </footer>
    </div>
  );
}

function CargoSelector({
  selectedCode,
  onSelect,
}: {
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="cargo-selector" aria-labelledby="cargo-selector-title">
      <p id="cargo-selector-title" className="px-1 pb-3 text-sm font-semibold">
        1. Escolha seu cargo ou especialidade{" "}
        <span className="text-muted-foreground">(16 no total)</span>
      </p>
      <label className="block lg:hidden">
        <span className="sr-only">Cargo ou especialidade</span>
        <select
          value={selectedCode}
          onChange={(event) => onSelect(event.target.value)}
          className="min-h-14 w-full rounded-lg border border-border bg-[var(--surface-2)] px-4 text-base font-medium text-foreground"
        >
          {EXAM_POSITIONS.map((position) => (
            <option key={position.code} value={position.code}>
              {position.specialty}
            </option>
          ))}
        </select>
        <span className="mt-2 block text-xs text-muted-foreground">
          Você poderá trocar de cargo quando quiser.
        </span>
      </label>
      <div className="hidden space-y-2 lg:block">
        {POSITION_GROUPS.map((group) => (
          <CargoGroup
            key={group.key}
            group={group.key}
            label={group.label}
            count={group.count}
            dateLabel={group.dateLabel}
            selectedCode={selectedCode}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_1fr]">
        <Button asChild variant="gold" size="lg">
          <Link to="/treino-livre" search={{ cargo: selectedCode }}>
            Começar treino livre <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
          <a href="#cargos">Ver todos os cargos</a>
        </Button>
      </div>
    </div>
  );
}

function CargoGroup({
  group,
  label,
  count,
  dateLabel,
  selectedCode,
  onSelect,
}: {
  group: PositionGroup;
  label: string;
  count: number;
  dateLabel: string;
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const positions = EXAM_POSITIONS.filter((position) => position.group === group);
  const Icon =
    group === "analista" ? GraduationCap : group === "auditor" ? ShieldCheck : ClipboardCheck;
  return (
    <details className="cargo-group" open={group === "auditor"}>
      <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-3 px-3 [&::-webkit-details-marker]:hidden">
        <span className="grid size-9 place-items-center rounded-lg border border-[var(--gold)]/40 text-[var(--gold)]">
          <Icon className="size-5" aria-hidden />
        </span>
        <span>
          <strong className="block text-sm text-[var(--gold)]">{label}</strong>
          <small className="text-muted-foreground">
            {count} {count === 1 ? "cargo" : "cargos"} · {dateLabel}
          </small>
        </span>
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform [[open]>&]:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-border/70">
        {positions.map((position) => (
          <button
            key={position.code}
            type="button"
            onClick={() => onSelect(position.code)}
            aria-pressed={selectedCode === position.code}
            className={`flex min-h-11 w-full items-center justify-between gap-3 border-b border-border/50 px-4 py-2 text-left text-sm last:border-b-0 ${selectedCode === position.code ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
          >
            <span>
              <span className="mr-2 text-xs">{position.number}.</span>
              {position.specialty}
            </span>
            {position.group === "auditor" && position.specialty === "Controle Externo" && (
              <Scale className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        ))}
      </div>
    </details>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[var(--gold)] [&>svg]:size-7">{icon}</span>
      <span>
        <strong className="block text-3xl">{value}</strong>
        <small className="text-muted-foreground">{label}</small>
      </span>
    </div>
  );
}

function StudyPath({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex min-w-0 gap-4 py-2">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold)]/50 text-[var(--gold)] [&>svg]:size-5">
        {icon}
      </span>
      <span>
        <strong className="font-display text-lg">{title}</strong>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </span>
    </div>
  );
}
