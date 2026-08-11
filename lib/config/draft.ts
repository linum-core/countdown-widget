import { DEFAULT_CONFIG } from '@/lib/config/schema';
import { parseTargetDate } from '@/lib/time/timezone';
import type { WidgetConfig } from '@/types/widget';

/**
 * Estado editável do gerador.
 *
 * As datas ficam como string no formato de `<input type="datetime-local">` em
 * vez de epoch: converter a cada tecla digitada faria o campo "pular" enquanto
 * a data ainda está incompleta. A conversão para `WidgetConfig` acontece uma
 * única vez, na derivação.
 */
export interface ConfigDraft extends Omit<WidgetConfig, 'targetMs' | 'fromMs'> {
  targetInput: string;
  fromInput: string;
}

/** Data sugerida ao abrir o gerador: mesma hora, 30 dias à frente. */
function defaultTargetInput(now: Date): string {
  const target = new Date(now.getTime());
  target.setDate(target.getDate() + 30);
  target.setSeconds(0, 0);

  const pad = (value: number): string => String(value).padStart(2, '0');
  return (
    `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}` +
    `T${pad(target.getHours())}:${pad(target.getMinutes())}`
  );
}

export function createInitialDraft(now: Date, timezone: string | null): ConfigDraft {
  return {
    ...DEFAULT_CONFIG,
    timezone,
    title: 'Casamento',
    subtitle: 'Nos vemos no altar',
    emoji: '💍',
    layout: 'cards',
    targetInput: defaultTargetInput(now),
    fromInput: '',
  };
}

/** Projeta o rascunho na `WidgetConfig` consumida pelo widget e pelo serializador. */
export function draftToConfig(draft: ConfigDraft): WidgetConfig {
  const { targetInput, fromInput, ...rest } = draft;

  return {
    ...rest,
    targetMs: targetInput ? parseTargetDate(targetInput, draft.timezone) : null,
    fromMs: fromInput ? parseTargetDate(fromInput, draft.timezone) : null,
  };
}
