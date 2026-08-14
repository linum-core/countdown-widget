/**
 * Resolução de datas em timezone IANA sem nenhuma dependência externa.
 * Toda a aritmética se apoia em `Intl.DateTimeFormat`, disponível nativamente
 * em Node e em todos os navegadores modernos.
 */

/*
 * Declarado aqui, e não importado de `./diff`: é `diff` quem depende deste
 * módulo, para contar meses de calendário. Importar de volta fecharia um ciclo.
 */
const MS_MINUTE = 60_000;

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
 * Soma meses de calendário a um instante, preservando a hora local.
 *
 * Mês não tem duração fixa, então isto não pode ser aritmética de milissegundos:
 * de 31 de janeiro a 28 de fevereiro passa "um mês", e de 1º de março a 1º de
 * abril também, com sete dias de diferença entre os dois. O dia é grampeado ao
 * último do mês de destino, pela mesma razão — 31 de janeiro mais um mês é o
 * fim de fevereiro, não 3 de março, que é o que `Date` faria sozinho.
 *
 * `timezone` nula cai na timezone do ambiente, mesma regra de `parseTargetDate`.
 */
export function addMonths(utcMs: number, months: number, timezone: string | null): number {
  const shift = (year: number, month: number, day: number) => {
    const total = year * 12 + (month - 1) + months;
    const shiftedYear = Math.floor(total / 12);
    const shiftedMonth = (((total % 12) + 12) % 12) + 1;
    return {
      year: shiftedYear,
      month: shiftedMonth,
      day: Math.min(day, daysInMonth(shiftedYear, shiftedMonth)),
    };
  };

  if (timezone && isValidTimezone(timezone)) {
    const [date, time] = formatNaiveInTimeZone(utcMs, timezone).split('T');
    const [year, month, day] = date!.split('-').map(Number);
    const [hour, minute, second] = time!.split(':').map(Number);

    return zonedTimeToUtc(
      { ...shift(year!, month!, day!), hour: hour!, minute: minute!, second: second! },
      timezone,
    );
  }

  const local = new Date(utcMs);
  const shifted = shift(local.getFullYear(), local.getMonth() + 1, local.getDate());

  return new Date(
    shifted.year,
    shifted.month - 1,
    shifted.day,
    local.getHours(),
    local.getMinutes(),
    local.getSeconds(),
    local.getMilliseconds(),
  ).getTime();
}

/**
 * Quantidade de meses de calendário cheios entre dois instantes.
 *
 * O palpite inicial usa a duração média do mês gregoriano e é corrigido por
 * passos de um mês, o que resolve em uma ou duas iterações em vez de percorrer
 * o intervalo inteiro.
 */
export function wholeMonthsBetween(fromMs: number, toMs: number, timezone: string | null): number {
  if (toMs <= fromMs) return 0;

  const AVERAGE_MONTH_MS = 30.436875 * 24 * 60 * 60 * 1000;
  let months = Math.max(0, Math.floor((toMs - fromMs) / AVERAGE_MONTH_MS));

  while (addMonths(fromMs, months + 1, timezone) <= toMs) months += 1;
  while (months > 0 && addMonths(fromMs, months, timezone) > toMs) months -= 1;

  return months;
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
