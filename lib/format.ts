import { UNIT_ORDER } from '@/lib/time/diff';
import type { TimeParts, UnitFlags, UnitKey, UnitLabels } from '@/types/widget';

/** Unidades ativas, na ordem de exibição. */
export function activeUnits(units: UnitFlags): UnitKey[] {
  return UNIT_ORDER.filter((unit) => units[unit]);
}

/** Abreviação usada pelo layout horizontal (`458d : 12h : 35m : 41s`). */
export const UNIT_SUFFIX: Record<UnitKey, string> = {
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
};

/**
 * Frase completa lida por leitores de tela.
 *
 * O texto substitui a leitura dígito a dígito: os números em si ficam
 * `aria-hidden`, porque narrar uma mudança por segundo tornaria o widget
 * inutilizável com leitor de tela ligado.
 */
export function buildAriaLabel(
  parts: TimeParts,
  units: UnitFlags,
  labels: UnitLabels,
  title: string,
): string {
  const enabled = activeUnits(units);
  if (enabled.length === 0) return title;

  const segments = enabled.map((unit) => `${parts[unit]} ${labels[unit].toLowerCase()}`);
  const list =
    segments.length > 1
      ? `${segments.slice(0, -1).join(', ')} e ${segments[segments.length - 1]}`
      : segments[0];

  return title ? `Faltam ${list} para ${title}` : `Faltam ${list}`;
}
