import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, LogOut, RotateCcw, Settings2 } from "lucide-react";

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
            search={{ mode: undefined }}
            className="flex items-center gap-2 font-display text-sm font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-md border border-[var(--gold)]/50 text-[var(--gold)]">
              <BookOpenCheck className="size-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">
              Passei! <span className="text-[var(--gold)]">TCE-MA</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link
              to="/treino"
              search={{ mode: undefined }}
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              <BookOpenCheck className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Treino</span>
            </Link>
            <Link
              to="/revisao"
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              <RotateCcw className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Revisão</span>
            </Link>
            <Link
              to="/preferencias"
              className="rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              <Settings2 className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Preferências</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="size-4" aria-hidden />
              <span className="hidden md:inline">Sair</span>
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
