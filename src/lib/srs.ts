/**
 * SM-2 puro em TypeScript. Espelho de referência da função SQL
 * `public.srs_sm2_next`. A verdade em produção é a SQL (usada pelo RPC
 * transacional). Este módulo existe para testes de conformidade.
 */
export const ALGORITHM_VERSION = "sm2.v1";

export interface SrsInput {
  easiness: number;
  interval_days: number;
  repetitions: number;
  grade: number; // 0..5
}
export interface SrsOutput {
  easiness: number;
  interval_days: number;
  repetitions: number;
}

export function sm2Next(input: SrsInput): SrsOutput {
  const { easiness, interval_days, repetitions, grade } = input;
  if (grade < 0 || grade > 5) throw new Error("grade must be 0..5");
  const newEf = Math.max(1.3, easiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  let newReps: number;
  let newInt: number;
  if (grade < 3) {
    newReps = 0;
    newInt = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInt = 1;
    else if (newReps === 2) newInt = 6;
    else newInt = Math.max(1, Math.round(interval_days * newEf));
  }
  return { easiness: Number(newEf.toFixed(2)), interval_days: newInt, repetitions: newReps };
}
