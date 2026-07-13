import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type CheckpointAnswer = { kind: string; value: string };

const PROMPTS = [
  {
    kind: "priority",
    question: "O que você quer priorizar agora?",
    options: [
      { v: "fundamentos", label: "Fundamentos" },
      { v: "revisao_erros", label: "Revisão de erros" },
      { v: "dificeis", label: "Questões difíceis" },
      { v: "velocidade", label: "Velocidade" },
      { v: "geral", label: "Continuar geral" },
    ],
  },
  {
    kind: "perceived_difficulty",
    question: "Como este bloco pareceu?",
    options: [
      { v: "facil", label: "Fácil" },
      { v: "adequado", label: "Adequado" },
      { v: "dificil", label: "Difícil" },
      { v: "nao_sei", label: "Ainda não sei" },
    ],
  },
  {
    kind: "effort",
    question: "Quer reduzir o esforço de interação?",
    options: [
      { v: "fonte_maior", label: "Fonte maior" },
      { v: "menos_animacao", label: "Menos animação" },
      { v: "padrao", label: "Manter padrão" },
    ],
  },
];

export function CheckpointDialog({
  open,
  onOpenChange,
  questionIndex,
  onAnswer,
  onSkip,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  questionIndex: number;
  onAnswer: (a: CheckpointAnswer) => void;
  onSkip: () => void;
}) {
  const prompt = PROMPTS[Math.floor((questionIndex / 5 - 1) % PROMPTS.length)] ?? PROMPTS[0];
  const [choice, setChoice] = useState<string | null>(null);

  function handleAnswer() {
    if (!choice) return;
    onAnswer({ kind: prompt.kind, value: choice });
    setChoice(null);
  }

  function handleSkip() {
    onSkip();
    setChoice(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleSkip(); else onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Pausa rápida</DialogTitle>
          <DialogDescription>
            Você concluiu {questionIndex} questões. Uma pergunta opcional para melhorar a seleção
            das próximas. Você pode pular a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="mt-2">
          <legend className="mb-2 text-sm font-medium">{prompt.question}</legend>
          <div className="space-y-2">
            {prompt.options.map((opt) => (
              <label
                key={opt.v}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2 hover:bg-[var(--surface-3)]"
              >
                <input
                  type="radio"
                  name="cp"
                  value={opt.v}
                  checked={choice === opt.v}
                  onChange={() => setChoice(opt.v)}
                  className="h-4 w-4 accent-[var(--gold)]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row">
          <Button variant="ghost" onClick={handleSkip}>
            Pular
          </Button>
          <Button variant="gold" onClick={handleAnswer} disabled={!choice}>
            Responder e continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
