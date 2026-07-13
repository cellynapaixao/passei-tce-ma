import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getReviewQueue } from "@/lib/reviews.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/revisao")({
  head: () => ({
    meta: [{ title: "Revisão — TCE-MA 2026" }, { name: "robots", content: "noindex" }],
  }),
  component: RevisaoPage,
});

function RevisaoPage() {
  const fetchQueue = useServerFn(getReviewQueue);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = await fetchQueue();
        setCount(q.length);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchQueue]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Revisão de erros</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Questões vencidas pela revisão espaçada (SM-2). O que você errou volta na hora certa.
      </p>

      <div className="surface-panel mt-8 p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Consultando fila…</p>
        ) : count && count > 0 ? (
          <>
            <p className="text-lg">
              Você tem <span className="font-semibold text-[var(--gold)]">{count}</span> questões
              vencidas para revisar.
            </p>
            <div className="mt-4">
              <Button asChild variant="gold" size="lg">
                <Link to="/treino">Iniciar revisão</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base">Nenhuma questão vencida agora.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue treinando. À medida que você responde, o algoritmo espaça as revisões.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/treino">Voltar ao treino</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
