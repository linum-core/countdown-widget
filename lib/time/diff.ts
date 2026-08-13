import { addMonths, wholeMonthsBetween } from '@/lib/time/timezone';
import type { TimeParts, UnitFlags, UnitKey } from '@/types/widget';

export const MS_SECOND = 1_000;
export const MS_MINUTE = 60 * MS_SECOND;
export const MS_HOUR = 60 * MS_MINUTE;
export const MS_DAY = 24 * MS_HOUR;

/** Ordem de exibição das unidades, da maior para a menor. */
export const UNIT_ORDER: readonly UnitKey[] = [
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;

/** Só as unidades de duração fixa entram aqui; mês depende do calendário. */
const UNIT_MS: Record<Exclude<UnitKey, 'months'>, number> = {
  days: MS_DAY,
  hours: MS_HOUR,
  minutes: MS_MINUTE,
  seconds: MS_SECOND,
};

const ALL_UNITS: UnitFlags = {
  months: false,
  days: true,
  hours: true,
  minutes: true,
  seconds: true,
};

/**
 * Calcula o tempo restante entre dois instantes.
 *
 * A diferença é sempre recomputada a partir de dois timestamps absolutos — nunca
 * por decremento acumulado — de modo que o contador não sofre drift por mais
 * tempo que fique aberto.
 *
 * Unidades desativadas são redistribuídas para a maior unidade ativa seguinte.
 * Exemplo: com `days: false`, um alvo a 2 dias exibe `48` horas.
 *
 * Mês é a exceção: sai do calendário, e não de uma duração média. "Faltam 11
 * meses e 5 dias" só é verdade se o mês contado for o mês real, com 28, 30 ou
 * 31 dias conforme o caso. O resto do intervalo, depois de descontados os meses
 * cheios, volta a ser aritmética de milissegundos como as demais unidades.
 */
export function computeTimeParts(
  targetMs: number,
  nowMs: number,
  units: UnitFlags = ALL_UNITS,
  timezone: string | null = null,
): TimeParts {
  const remainingMs = Math.max(0, targetMs - nowMs);
  const ended = remainingMs === 0;

  const parts: Record<UnitKey, number> = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const enabled = UNIT_ORDER.filter((unit) => units[unit]);

  // Sem nenhuma unidade ativa não há o que distribuir: tudo fica em zero.
  if (enabled.length === 0) {
    return { ...parts, remainingMs, ended };
  }

  let rest = remainingMs;

  if (units.months && !ended) {
    parts.months = wholeMonthsBetween(nowMs, targetMs, timezone);
    rest = targetMs - addMonths(nowMs, parts.months, timezone);
  }

  for (const unit of enabled) {
    if (unit === 'months') continue;
    const size = UNIT_MS[unit];
    const value = Math.floor(rest / size);
    parts[unit] = value;
    rest -= value * size;
  }

  return { ...parts, remainingMs, ended };
}

/**
 * Fração decorrida entre `fromMs` e `targetMs`, no intervalo [0, 1].
 * Retorna `null` quando o intervalo é inválido (origem igual ou posterior ao alvo).
 */
export function computeProgress(fromMs: number, targetMs: number, nowMs: number): number | null {
  const span = targetMs - fromMs;
  if (span <= 0) return null;
  const elapsed = nowMs - fromMs;
  return Math.min(1, Math.max(0, elapsed / span));
}

/** Formata um número com no mínimo `pad` dígitos (`5` -> `05`). */
export function padValue(value: number, pad = 2): string {
  return String(value).padStart(pad, '0');
}
