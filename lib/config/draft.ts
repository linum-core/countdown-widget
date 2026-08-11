import { DEFAULT_CONFIG } from '@/lib/config/schema';
import { formatNaiveInTimeZone, parseTargetDate } from '@/lib/time/timezone';
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

/** Formata um instante no fuso do navegador, no formato do `datetime-local`. */
function toLocalInput(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Data sugerida ao abrir o gerador: mesma hora, 30 dias à frente. */
function defaultTargetInput(now: Date): string {
  const target = new Date(now.getTime());
  target.setDate(target.getDate() + 30);
  target.setSeconds(0, 0);

  return toLocalInput(target);
}

/**
 * Instante de volta ao campo de data.
 *
 * Com timezone escolhida, a hora exibida é a de lá — é o mesmo número que o
 * usuário digitou antes de compartilhar o link, e não a tradução dele para o
 * fuso de quem abriu.
 */
function toDateInput(utcMs: number | null, timezone: string | null): string {
  if (utcMs == null) return '';
  return timezone
    ? formatNaiveInTimeZone(utcMs, timezone).slice(0, 16)
    : toLocalInput(new Date(utcMs));
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

/**
 * Caminho inverso: hidrata o formulário a partir de uma configuração.
 *
 * É o que faz um link de edição compartilhado abrir com todos os campos
 * preenchidos, já que a configuração inteira viaja na query string.
 */
export function configToDraft(config: WidgetConfig): ConfigDraft {
  const { targetMs, fromMs, ...rest } = config;

  return {
    ...rest,
    targetInput: toDateInput(targetMs, config.timezone),
    fromInput: toDateInput(fromMs, config.timezone),
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
