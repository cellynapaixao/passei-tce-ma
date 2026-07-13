import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TCE-MA 2026 — Treinador de precisão" },
      {
        name: "description",
        content:
          "Qualificação por questões para o concurso TCE-MA 2026: seleção adaptativa, feedback pedagógico e revisão espaçada.",
      },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/treino" });
  },
  component: Landing,
});

function Landing() {
  return (
    <main id="conteudo-principal" className="min-h-dvh bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--gold)]" aria-hidden />
            <span className="font-display text-sm font-semibold tracking-wide">TCE-MA 2026</span>
          </div>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <p className="mb-4 inline-block rounded-full border border-[var(--gold)]/40 px-3 py-1 text-xs uppercase tracking-wider text-[var(--gold)]">
          Cebraspe · 22 e 29 de novembro de 2026
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
          Treinador de precisão para o concurso do TCE-MA.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Cada questão é uma decisão pedagógica. O sistema mostra qual estudar agora, por que ela
          foi escolhida, o que o resultado revela e a próxima ação de revisão.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/auth" search={{ mode: "signup" }}>Criar conta e começar</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth" search={{ mode: "signin" }}>Entrar</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Sem perfil obrigatório",
              d: "Começa direto em Treino Geral. Cargo, especialidade e preferências ficam opcionais.",
            },
            {
              t: "Feedback que ensina",
              d: "Resultado, regra central, distratores e fonte oficial após cada resposta.",
            },
            {
              t: "Revisão espaçada versionada",
              d: "SM-2 com rastreabilidade. O que você errou volta na hora certa.",
            },
          ].map((c) => (
            <div key={c.t} className="surface-panel p-5">
              <h2 className="font-display text-base font-semibold text-[var(--gold)]">{c.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-5 py-6 text-xs text-muted-foreground">
          Fase 1: questões objetivas. Redações e discursivas ficam para uma fase posterior.
        </div>
      </footer>
    </main>
  );
}
