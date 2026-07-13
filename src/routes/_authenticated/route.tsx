import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3"
        >
          <Link
            to="/treino"
            className="flex items-center gap-2 font-display text-sm font-semibold"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--gold)]" aria-hidden />
            TCE-MA 2026
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link
              to="/treino"
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Treino
            </Link>
            <Link
              to="/revisao"
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Revisão
            </Link>
            <Link
              to="/preferencias"
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Preferências
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </nav>
      </header>
      <main id="conteudo-principal">
        <Outlet />
      </main>
    </div>
  );
}

// Type-safe context uses QueryClient
export type _AuthenticatedContext = { queryClient: QueryClient };
