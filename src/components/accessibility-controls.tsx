import { useEffect, useState, type ReactNode } from "react";
import { Accessibility, Contrast, Speech, Type, ZapOff } from "lucide-react";

import {
  applyAccessibilityPreferences,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  readAccessibilityPreferences,
  type AccessibilityPreferences,
} from "@/lib/accessibility-preferences";

export function AccessibilityControls({
  onChange,
}: {
  onChange?: (preferences: AccessibilityPreferences) => void;
}) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    DEFAULT_ACCESSIBILITY_PREFERENCES,
  );

  useEffect(() => {
    const saved = readAccessibilityPreferences();
    setPreferences(saved);
    applyAccessibilityPreferences(saved);
    onChange?.(saved);
  }, [onChange]);

  function update(partial: Partial<AccessibilityPreferences>) {
    const next = { ...preferences, ...partial };
    setPreferences(next);
    applyAccessibilityPreferences(next);
    onChange?.(next);
  }

  function cycleFontSize() {
    const next = preferences.font_scale === 100 ? 115 : preferences.font_scale === 115 ? 130 : 100;
    update({ font_scale: next });
  }

  return (
    <details className="relative">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-[var(--gold)]/60 hover:text-foreground [&::-webkit-details-marker]:hidden">
        <Accessibility className="size-4" aria-hidden />
        <span className="hidden sm:inline">Acessibilidade</span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(21rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 shadow-2xl">
        <p className="px-2 pb-2 font-display text-sm font-semibold">
          Ajustes de leitura e interação
        </p>
        <div className="grid gap-1">
          <button
            type="button"
            onClick={cycleFontSize}
            className="flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-accent"
          >
            <span className="flex items-center gap-2">
              <Type className="size-4" aria-hidden /> Fonte
            </span>
            <span className="text-[var(--gold)]">{preferences.font_scale}%</span>
          </button>
          <ToggleRow
            icon={<Contrast className="size-4" aria-hidden />}
            label="Alto contraste"
            pressed={preferences.high_contrast}
            onClick={() => update({ high_contrast: !preferences.high_contrast })}
          />
          <ToggleRow
            icon={<ZapOff className="size-4" aria-hidden />}
            label="Reduzir animações"
            pressed={preferences.reduce_motion}
            onClick={() => update({ reduce_motion: !preferences.reduce_motion })}
          />
          <ToggleRow
            icon={<Speech className="size-4" aria-hidden />}
            label="Leitura em voz alta"
            pressed={preferences.tts_enabled}
            onClick={() => update({ tts_enabled: !preferences.tts_enabled })}
          />
        </div>
      </div>
    </details>
  );
}

function ToggleRow({
  icon,
  label,
  pressed,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-accent"
    >
      <span className="flex items-center gap-2">
        {icon} {label}
      </span>
      <span className={pressed ? "text-[var(--correct)]" : "text-muted-foreground"}>
        {pressed ? "Ativo" : "Inativo"}
      </span>
    </button>
  );
}
