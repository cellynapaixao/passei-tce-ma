import { Link } from "@tanstack/react-router";
import { Landmark, LogIn } from "lucide-react";
import { AccessibilityControls } from "@/components/accessibility-controls";
import type { AccessibilityPreferences } from "@/lib/accessibility-preferences";

export function PublicHeader({
  onAccessibilityChange,
}: {
  onAccessibilityChange?: (preferences: AccessibilityPreferences) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/94 backdrop-blur-xl">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-lg border border-[var(--gold)]/60 text-[var(--gold)]">
            <Landmark className="size-5" aria-hidden />
          </span>
          <span>
            Passei! <span className="text-[var(--gold)]">TCE-MA</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/treino-livre"
            search={{ cargo: undefined }}
            className="hidden min-h-11 items-center px-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Treino
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="hidden min-h-11 items-center px-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Minha conta
          </Link>
          <AccessibilityControls onChange={onAccessibilityChange} />
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            aria-label="Entrar"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border/70 px-3 text-sm hover:border-[var(--gold)]/60"
          >
            <LogIn className="size-4 text-[var(--gold)]" aria-hidden />
            <span>Entrar</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
