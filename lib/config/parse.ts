import { normalizeHex } from '@/lib/color';
import { isValidTimezone, parseTargetDate } from '@/lib/time/timezone';
import type { WidgetConfig } from '@/types/widget';
import {
  ANIMATIONS,
  DEFAULT_CONFIG,
  FONTS,
  LAYOUTS,
  PARAM_ALIASES,
  RADIUS_MAX,
  RADIUS_MIN,
  SIZES,
  SKINS,
  TEXT_MAX_LENGTH,
  THEMES,
  type ParamName,
} from './schema';

/**
 * Formato aceito pelos Server Components do Next para `searchParams`.
 * Um parâmetro repetido chega como array; usamos sempre a primeira ocorrência.
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

type ParamSource = URLSearchParams | RawSearchParams;

function readParam(source: ParamSource, name: ParamName): string | null {
  const aliases = PARAM_ALIASES[name];

  for (const alias of aliases) {
    const raw =
      source instanceof URLSearchParams
        ? source.get(alias)
        : ((): string | undefined => {
            const value = source[alias];
            return Array.isArray(value) ? value[0] : value;
          })();

    if (raw != null && raw !== '') return raw;
  }

  return null;
}

/**
 * Diz se a URL traz alguma configuração conhecida.
 *
 * Serve para separar "link compartilhado" de "primeira visita": no primeiro
 * caso o gerador abre com o que veio na URL, no segundo com o rascunho de
 * demonstração. Parâmetro estranho — de campanha, por exemplo — não conta.
 */
export function hasAnyParam(source: ParamSource): boolean {
  return (Object.keys(PARAM_ALIASES) as ParamName[]).some(
    (name) => readParam(source, name) != null,
  );
}

/** Aceita `true/1/yes/on/sim` e `false/0/no/off/nao`; qualquer outra coisa cai no default. */
function parseBoolean(raw: string | null, fallback: boolean): boolean {
  if (raw == null) return fallback;
  const value = raw.trim().toLowerCase();
  if (['true', '1', 'yes', 'on', 'sim'].includes(value)) return true;
  if (['false', '0', 'no', 'off', 'nao', 'não'].includes(value)) return false;
  return fallback;
}

function parseEnum<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  if (raw == null) return fallback;
  const value = raw.trim().toLowerCase() as T;
  return allowed.includes(value) ? value : fallback;
}

/** Como `parseEnum`, mas sem default: valor ausente ou desconhecido vira `null`. */
function parseOptionalEnum<T extends string>(raw: string | null, allowed: readonly T[]): T | null {
  if (raw == null) return null;
  const value = raw.trim().toLowerCase() as T;
  return allowed.includes(value) ? value : null;
}

function parseText(raw: string | null, fallback: string): string {
  if (raw == null) return fallback;
  return raw.slice(0, TEXT_MAX_LENGTH);
}

function parseNumber(raw: string | null, fallback: number, min: number, max: number): number {
  if (raw == null) return fallback;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Hex válido normalizado, ou `null` — que significa "segue o tema". */
function parseOptionalColor(raw: string | null): string | null {
  return raw ? normalizeHex(raw) : null;
}

/** `transparent` (default) ou um hex válido; entrada inválida vira transparente. */
function parseBackground(raw: string | null): string {
  if (raw == null) return DEFAULT_CONFIG.background;
  const value = raw.trim().toLowerCase();
  if (value === 'transparent' || value === 'none') return 'transparent';
  return normalizeHex(value) ?? DEFAULT_CONFIG.background;
}

/**
 * Converte parâmetros de URL em uma `WidgetConfig` completa.
 *
 * Esta função é total: nunca lança e sempre devolve um objeto utilizável.
 * Qualquer valor inválido é silenciosamente substituído pelo default — dentro
 * de um embed, uma tela em branco por causa de um parâmetro errado seria o
 * pior resultado possível.
 */
export function parseConfig(source: ParamSource): WidgetConfig {
  const read = (name: ParamName): string | null => readParam(source, name);

  const rawTimezone = read('timezone');
  const timezone = rawTimezone && isValidTimezone(rawTimezone) ? rawTimezone : null;

  const rawTarget = read('target');
  const targetMs = rawTarget ? parseTargetDate(rawTarget, timezone) : null;

  const rawFrom = read('from');
  const fromMs = rawFrom ? parseTargetDate(rawFrom, timezone) : null;

  return {
    targetMs,
    timezone,
    fromMs,

    title: parseText(read('title'), DEFAULT_CONFIG.title),
    subtitle: parseText(read('subtitle'), DEFAULT_CONFIG.subtitle),
    emoji: parseText(read('emoji'), DEFAULT_CONFIG.emoji),

    layout: parseEnum(read('layout'), LAYOUTS, DEFAULT_CONFIG.layout),
    theme: parseEnum(read('theme'), THEMES, DEFAULT_CONFIG.theme),
    size: parseEnum(read('size'), SIZES, DEFAULT_CONFIG.size),
    font: parseEnum(read('font'), FONTS, DEFAULT_CONFIG.font),
    titleFont: parseOptionalEnum(read('titleFont'), FONTS),
    skin: parseEnum(read('skin'), SKINS, DEFAULT_CONFIG.skin),
    animation: parseEnum(read('animation'), ANIMATIONS, DEFAULT_CONFIG.animation),

    color: parseOptionalColor(read('color')),
    numberColor: parseOptionalColor(read('numberColor')),
    titleColor: parseOptionalColor(read('titleColor')),
    labelColor: parseOptionalColor(read('labelColor')),
    background: parseBackground(read('background')),
    radius: parseNumber(read('radius'), DEFAULT_CONFIG.radius, RADIUS_MIN, RADIUS_MAX),

    units: {
      days: parseBoolean(read('days'), DEFAULT_CONFIG.units.days),
      hours: parseBoolean(read('hours'), DEFAULT_CONFIG.units.hours),
      minutes: parseBoolean(read('minutes'), DEFAULT_CONFIG.units.minutes),
      seconds: parseBoolean(read('seconds'), DEFAULT_CONFIG.units.seconds),
    },
    labels: {
      days: parseText(read('labelDays'), DEFAULT_CONFIG.labels.days),
      hours: parseText(read('labelHours'), DEFAULT_CONFIG.labels.hours),
      minutes: parseText(read('labelMinutes'), DEFAULT_CONFIG.labels.minutes),
      seconds: parseText(read('labelSeconds'), DEFAULT_CONFIG.labels.seconds),
    },
    endedText: parseText(read('endedText'), DEFAULT_CONFIG.endedText),

    icons: parseBoolean(read('icons'), DEFAULT_CONFIG.icons),
    progress: parseBoolean(read('progress'), DEFAULT_CONFIG.progress),
  };
}
