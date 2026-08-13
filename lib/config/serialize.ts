import { formatNaiveInTimeZone } from '@/lib/time/timezone';
import type { WidgetConfig } from '@/types/widget';
import { DEFAULT_CONFIG, PARAM_ALIASES, type ParamName } from './schema';

/** Nome canônico de cada parâmetro (o primeiro alias declarado no schema). */
function canonical(name: ParamName): string {
  return PARAM_ALIASES[name][0];
}

/**
 * Representação de um instante para a URL.
 *
 * Com timezone definida emitimos a data "ingênua" naquela zona — legível e
 * estável. Sem timezone, emitimos ISO com offset explícito, que é absoluto e
 * portanto imune à timezone de quem abrir o link depois.
 */
function formatInstant(utcMs: number, timezone: string | null): string {
  return timezone ? formatNaiveInTimeZone(utcMs, timezone) : new Date(utcMs).toISOString();
}

/**
 * Converte uma `WidgetConfig` em query string, omitindo tudo que já é default.
 * O resultado mantém URLs curtas e legíveis, e faz round-trip exato com `parseConfig`.
 */
export function serializeConfig(config: WidgetConfig): string {
  const params = new URLSearchParams();
  const set = (name: ParamName, value: string): void => {
    params.set(canonical(name), value);
  };

  // Timezone vem antes de target: quem lê a URL precisa dela para interpretar a data.
  if (config.timezone) set('timezone', config.timezone);
  if (config.targetMs != null) set('target', formatInstant(config.targetMs, config.timezone));
  if (config.fromMs != null) set('from', formatInstant(config.fromMs, config.timezone));

  if (config.title) set('title', config.title);
  if (config.subtitle) set('subtitle', config.subtitle);
  if (config.emoji) set('emoji', config.emoji);

  if (config.layout !== DEFAULT_CONFIG.layout) set('layout', config.layout);
  if (config.theme !== DEFAULT_CONFIG.theme) set('theme', config.theme);
  if (config.size !== DEFAULT_CONFIG.size) set('size', config.size);
  if (config.font !== DEFAULT_CONFIG.font) set('font', config.font);
  if (config.titleFont) set('titleFont', config.titleFont);
  if (config.skin !== DEFAULT_CONFIG.skin) set('skin', config.skin);
  if (config.animation !== DEFAULT_CONFIG.animation) set('animation', config.animation);

  if (config.color) set('color', config.color);
  if (config.numberColor) set('numberColor', config.numberColor);
  if (config.titleColor) set('titleColor', config.titleColor);
  if (config.labelColor) set('labelColor', config.labelColor);
  if (config.background !== DEFAULT_CONFIG.background) set('background', config.background);
  if (config.radius !== DEFAULT_CONFIG.radius) set('radius', String(config.radius));

  if (config.units.months !== DEFAULT_CONFIG.units.months) {
    set('months', String(config.units.months));
  }
  if (config.units.days !== DEFAULT_CONFIG.units.days) set('days', String(config.units.days));
  if (config.units.hours !== DEFAULT_CONFIG.units.hours) set('hours', String(config.units.hours));
  if (config.units.minutes !== DEFAULT_CONFIG.units.minutes) {
    set('minutes', String(config.units.minutes));
  }
  if (config.units.seconds !== DEFAULT_CONFIG.units.seconds) {
    set('seconds', String(config.units.seconds));
  }

  if (config.labels.months !== DEFAULT_CONFIG.labels.months) {
    set('labelMonths', config.labels.months);
  }
  if (config.labels.days !== DEFAULT_CONFIG.labels.days) set('labelDays', config.labels.days);
  if (config.labels.hours !== DEFAULT_CONFIG.labels.hours) set('labelHours', config.labels.hours);
  if (config.labels.minutes !== DEFAULT_CONFIG.labels.minutes) {
    set('labelMinutes', config.labels.minutes);
  }
  if (config.labels.seconds !== DEFAULT_CONFIG.labels.seconds) {
    set('labelSeconds', config.labels.seconds);
  }
  if (config.endedText !== DEFAULT_CONFIG.endedText) set('endedText', config.endedText);

  if (config.icons !== DEFAULT_CONFIG.icons) set('icons', String(config.icons));
  if (config.progress !== DEFAULT_CONFIG.progress) set('progress', String(config.progress));

  return params.toString();
}

/** URL completa do widget para uma configuração. */
export function buildWidgetUrl(config: WidgetConfig, origin: string): string {
  const query = serializeConfig(config);
  const base = `${origin.replace(/\/$/, '')}/w`;
  return query ? `${base}?${query}` : base;
}

/**
 * Snippet `<iframe>` para sites que aceitam HTML.
 *
 * Não serve para o Notion: o bloco `/embed` recebe uma URL e não interpreta
 * marcação — colar isto lá produz um parágrafo de texto.
 */
export function buildEmbedCode(url: string, height = 220): string {
  return `<iframe src="${url}" width="100%" height="${height}" frameborder="0" style="border:0;background:transparent" loading="lazy"></iframe>`;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Página autônoma com a contagem ocupando a janela inteira.
 *
 * Serve para abrir do disco, hospedar em outro lugar ou apontar um app de
 * papel de parede. O Notion continua fora: arquivo enviado lá vira anexo com
 * link de download, não embed.
 */
export function buildStandaloneHtml(url: string, title = 'Contagem regressiva'): string {
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${safeTitle}</title>
    <style>
      html, body { height: 100%; margin: 0; background: transparent; }
      iframe { display: block; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe src="${escapeHtml(url)}" title="${safeTitle}"></iframe>
  </body>
</html>
`;
}
