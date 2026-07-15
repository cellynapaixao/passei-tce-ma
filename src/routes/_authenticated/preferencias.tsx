import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { getPreferences, updatePreferences } from "@/lib/preferences.functions";
import { listPositions } from "@/lib/editions.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/preferencias")({
  head: () => ({
    meta: [{ title: "Preferências — TCE-MA 2026" }, { name: "robots", content: "noindex" }],
  }),
  component: PrefsPage,
});

interface Position {
  id: string;
  cargo: string;
  especialidade: string;
  full_name: string;
  exam_date: string | null;
}

function applyPrefsToHtml(p: {
  font_scale: number;
  high_contrast: boolean;
  reduce_motion: boolean;
}) {
  const el = document.documentElement;
  el.classList.toggle("a11y-hc", p.high_contrast);
  el.classList.toggle("a11y-reduce-motion", p.reduce_motion);
  el.classList.remove("a11y-scale-115", "a11y-scale-130");
  if (p.font_scale === 115) el.classList.add("a11y-scale-115");
  if (p.font_scale === 130) el.classList.add("a11y-scale-130");
  localStorage.setItem("tce-prefs", JSON.stringify(p));
}

function PrefsPage() {
  const getPrefs = useServerFn(getPreferences);
  const savePrefs = useServerFn(updatePreferences);
  const listPos = useServerFn(listPositions);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prefs, setPrefs] = useState({
    font_scale: 100,
    high_contrast: false,
    reduce_motion: false,
    tts_enabled: false,
    preferred_position_id: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const [p, pos] = await Promise.all([getPrefs(), listPos()]);
        setPrefs({
          font_scale: p.font_scale ?? 100,
          high_contrast: !!p.high_contrast,
          reduce_motion: !!p.reduce_motion,
          tts_enabled: !!p.tts_enabled,
          preferred_position_id: p.preferred_position_id ?? null,
        });
        setPositions(pos as Position[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [getPrefs, listPos]);

  async function save(partial: Partial<typeof prefs>) {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    applyPrefsToHtml(next);
    setSaving(true);
    try {
      await savePrefs({ data: partial });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Preferências</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajustes opcionais. Nada aqui é obrigatório para começar a estudar.
        </p>
      </div>

      <section className="surface-panel p-6 space-y-5" aria-labelledby="a11y">
        <h2 id="a11y" className="font-display text-lg font-semibold">
          Acessibilidade
        </h2>

        <div>
          <Label className="mb-2 block">Tamanho da fonte</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { v: 100, label: "Normal" },
              { v: 115, label: "Grande" },
              { v: 130, label: "Muito grande" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => save({ font_scale: o.v })}
                aria-pressed={prefs.font_scale === o.v}
                className={
                  "rounded-md border px-4 py-2 text-sm " +
                  (prefs.font_scale === o.v
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-border text-muted-foreground")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="hc">Alto contraste</Label>
            <p className="text-xs text-muted-foreground">Preto sobre branco, foco reforçado.</p>
          </div>
          <Switch
            id="hc"
            checked={prefs.high_contrast}
            onCheckedChange={(v) => save({ high_contrast: v })}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="tts">Leitura em voz alta</Label>
            <p className="text-xs text-muted-foreground">
              Exibe o comando para ouvir enunciado e alternativas.
            </p>
          </div>
          <Switch
            id="tts"
            checked={prefs.tts_enabled}
            onCheckedChange={(value) => save({ tts_enabled: value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="rm">Reduzir animações</Label>
            <p className="text-xs text-muted-foreground">Menos movimento nas transições.</p>
          </div>
          <Switch
            id="rm"
            checked={prefs.reduce_motion}
            onCheckedChange={(v) => save({ reduce_motion: v })}
          />
        </div>
      </section>

      <section className="surface-panel p-6 space-y-4" aria-labelledby="cargo">
        <h2 id="cargo" className="font-display text-lg font-semibold">
          Cargo preferido (opcional)
        </h2>
        <p className="text-sm text-muted-foreground">
          Quando definido, o Treino Geral prioriza questões aderentes ao seu cargo. Você pode mudar
          a qualquer momento.
        </p>
        <select
          className="w-full rounded-md border border-input bg-[var(--surface-2)] px-3 py-2 text-sm"
          value={prefs.preferred_position_id ?? ""}
          onChange={(e) => save({ preferred_position_id: e.target.value || null })}
          aria-label="Selecionar cargo"
        >
          <option value="">Sem preferência — Treino Geral</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} · {p.exam_date}
            </option>
          ))}
        </select>
      </section>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {saving ? "Salvando…" : "Alterações salvas automaticamente."}
      </p>

      <Button variant="outline" asChild>
        <a href="/treino">Voltar ao treino</a>
      </Button>
    </div>
  );
}
