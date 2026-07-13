import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[var(--gold-foreground)] hover:bg-[var(--gold-muted)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Não foi possível carregar a página</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[var(--gold-foreground)]"
          >
            Tentar novamente
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TCE-MA 2026 — Treinador de precisão para o concurso" },
      {
        name: "description",
        content:
          "Plataforma de qualificação por questões para o TCE-MA 2026: seleção adaptativa, feedback pedagógico e revisão espaçada.",
      },
      { property: "og:title", content: "TCE-MA 2026 — Treinador de precisão" },
      {
        property: "og:description",
        content:
          "Cada questão é uma decisão pedagógica: qual estudar agora, por que, e o que fazer depois.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#conteudo-principal" className="skip-link focus:skip-link-visible">
          Ir para o conteúdo
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ApplyPreferences() {
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("tce-prefs") : null;
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      const el = document.documentElement;
      el.classList.toggle("a11y-hc", !!p.high_contrast);
      el.classList.toggle("a11y-reduce-motion", !!p.reduce_motion);
      el.classList.remove("a11y-scale-115", "a11y-scale-130");
      if (p.font_scale === 115) el.classList.add("a11y-scale-115");
      if (p.font_scale === 130) el.classList.add("a11y-scale-130");
    } catch {}
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <ApplyPreferences />
      <Outlet />
    </QueryClientProvider>
  );
}
