import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
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
    <div className="min-h-dvh bg-background pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-5"
        >
          <Link
            to="/treino"
            search={{ mode: undefined }}
            className="flex items-center gap-2 font-display text-sm font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-md border border-[var(--gold)]/50 text-[var(--gold)]">
              <BookOpenCheck className="size-4" aria-hidden />
            </span>
            <span>
              Passei! <span className="text-[var(--gold)]">TCE-MA</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link
              to="/treino"
              search={{ mode: undefined }}
              className="hidden rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Treino
            </Link>
            <Link
              to="/revisao"
              className="hidden rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Revisão
            </Link>
            <Link
              to="/preferencias"
              className="hidden rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex [&.active]:text-[var(--gold)]"
              activeProps={{ className: "active" }}
            >
              Preferências
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sair da conta">
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </nav>
      </header>
      <main id="conteudo-principal">
        <Outlet />
      </main>
      <nav
        aria-label="Navegação da conta"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      >
        <div className="grid grid-cols-3">
          <MobileNavLink to="/treino" label="Treino" icon={<BookOpenCheck />} />
          <MobileNavLink to="/revisao" label="Revisão" icon={<RotateCcw />} />
          <MobileNavLink to="/preferencias" label="Ajustes" icon={<Settings2 />} />
        </div>
      </nav>
    </div>
  );
}

function MobileNavLink({
  to,
  label,
  icon,
}: {
  to: "/treino" | "/revisao" | "/preferencias";
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      search={to === "/treino" ? { mode: undefined } : undefined}
      className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground [&.active]:text-[var(--gold)]"
      activeProps={{ className: "active" }}
    >
      <span className="[&>svg]:size-5" aria-hidden>
        {icon}
      </span>
      {label}
    </Link>
  );
}

// Type-safe context uses QueryClient
export type _AuthenticatedContext = { queryClient: QueryClient };
