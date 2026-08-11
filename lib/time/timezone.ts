import { MS_MINUTE } from './diff';

/**
 * Resolução de datas em timezone IANA sem nenhuma dependência externa.
 * Toda a aritmética se apoia em `Intl.DateTimeFormat`, disponível nativamente
 * em Node e em todos os navegadores modernos.
 */

/** Aceita `2027-05-15T16:00:00`, `2027-05-15 16:00`, `2027-05-15` e variações com segundos. */
const NAIVE_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/;

/** Um offset explícito (`Z` ou `±HH:MM`) torna a string absoluta. */
const HAS_OFFSET_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/** Número de dias do mês (1-12) no ano informado, respeitando anos bissextos. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidTimezone(timezone: string): boolean {
  if (!timezone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset da timezone, em minutos, no instante `utcMs`.
 * Positivo a leste de Greenwich (`America/Sao_Paulo` -> `-180`).
 */
function offsetMinutesAt(utcMs: number, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(new Date(utcMs));
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number(part.value) : 0;
  };

  // `hour` pode vir como 24 em algumas engines quando hour12 é false.
  const hour = read('hour') % 24;
  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    hour,
    read('minute'),
    read('second'),
  );

  return Math.round((asUtc - utcMs) / MS_MINUTE);
}

/**
 * Converte componentes de data "ingênuos" (sem offset) para epoch ms,
 * interpretando-os como hora local da timezone informada.
 *
 * Usa duas passagens: a primeira estima o offset tratando os componentes como
 * UTC, a segunda corrige o resultado com o offset real daquele instante. Isso
 * dá a resposta certa inclusive nas bordas de horário de verão, onde o offset
 * antes e depois da conversão difere.
 */
export function zonedTimeToUtc(
  parts: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  timezone: string,
): number {
  const naiveUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  let utcMs = naiveUtc - offsetMinutesAt(naiveUtc, timezone) * MS_MINUTE;
  const secondOffset = offsetMinutesAt(utcMs, timezone);
  utcMs = naiveUtc - secondOffset * MS_MINUTE;

  return utcMs;
}

/**
 * Formata um instante como `YYYY-MM-DDTHH:mm:ss` na timezone informada.
 * É a operação inversa de `zonedTimeToUtc`, usada para reescrever a URL sem
 * perder legibilidade do parâmetro `target`.
 */
export function formatNaiveInTimeZone(utcMs: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));

  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '00';

  const hour = String(Number(read('hour')) % 24).padStart(2, '0');
  return `${read('year')}-${read('month')}-${read('day')}T${hour}:${read('minute')}:${read('second')}`;
}

/**
 * Interpreta a string recebida por URL e devolve o instante em epoch ms.
 *
 * - String com offset explícito (`Z`, `+03:00`): absoluta, `timezone` é ignorada.
 * - String sem offset + `timezone` válida: interpretada naquela timezone.
 * - String sem offset e sem `timezone`: interpretada na timezone do visitante,
 *   o que só é resolvido no cliente — no servidor cai na timezone do runtime (UTC).
 *
 * Retorna `null` para qualquer entrada inválida; nunca lança.
 */
export function parseTargetDate(raw: string, timezone: string | null): number | null {
  const value = raw.trim();
  if (!value) return null;

  if (HAS_OFFSET_RE.test(value)) {
    const absolute = Date.parse(value);
    return Number.isNaN(absolute) ? null : absolute;
  }

  const match = NAIVE_DATE_RE.exec(value);
  if (!match) {
    // Última tentativa para formatos como `2027/05/15` que o motor entende.
    const fallback = Date.parse(value);
    return Number.isNaN(fallback) ? null : fallback;
  }

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] ?? '0'),
    minute: Number(match[5] ?? '0'),
    second: Number(match[6] ?? '0'),
  };

  if (parts.month < 1 || parts.month > 12 || parts.day < 1) return null;
  if (parts.hour > 23 || parts.minute > 59 || parts.second > 59) return null;
  // Guarda contra datas irreais (ex.: 31 de fevereiro), que o `Date` rolaria adiante.
  if (parts.day > daysInMonth(parts.year, parts.month)) return null;

  if (timezone && isValidTimezone(timezone)) {
    return zonedTimeToUtc(parts, timezone);
  }

  // Sem timezone declarada, `new Date(...)` usa a timezone do ambiente.
  const localMs = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  ).getTime();
  return Number.isNaN(localMs) ? null : localMs;
}
