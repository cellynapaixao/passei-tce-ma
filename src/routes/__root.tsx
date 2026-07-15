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
import { Toaster } from "@/components/ui/sonner";

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
        <h1 className="text-xl font-semibold text-foreground">
          Não foi possível carregar a página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[var(--gold-foreground)]"
          >
            Tentar novamente
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">
            Início
          </a>
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
      { title: "Passei! TCE-MA — Treino orientado pelo edital 2026" },
      {
        name: "description",
        content:
          "Escolha entre os 16 cargos do TCE-MA 2026 e teste um treino de questões com feedback pedagógico.",
      },
      { property: "og:title", content: "Passei! TCE-MA" },
      {
        property: "og:description",
        content:
          "Qualificação por questões para o concurso TCE-MA 2026: seleção adaptativa, feedback pedagógico e revisão espaçada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Passei! TCE-MA" },
      {
        name: "twitter:description",
        content:
          "Qualificação por questões para o concurso TCE-MA 2026: seleção adaptativa, feedback pedagógico e revisão espaçada.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2ef945b6-19ca-4fe5-b879-537f0fef2172/id-preview-2e9cad05--f69170a1-ea5b-472f-abbe-9cbc04dd448c.lovable.app-1783981014737.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2ef945b6-19ca-4fe5-b879-537f0fef2172/id-preview-2e9cad05--f69170a1-ea5b-472f-abbe-9cbc04dd448c.lovable.app-1783981014737.png",
      },
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
    } catch {
      // Preferências inválidas são ignoradas e os padrões visuais permanecem ativos.
    }
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
      return;
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
      <Toaster />
    </QueryClientProvider>
  );
}
