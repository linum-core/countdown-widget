/** Utilitários de cor. Puros, sem DOM — o parser e o gerador compartilham estas funções. */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Normaliza um hex vindo da URL para `#rrggbb`.
 * Aceita com ou sem `#`, em 3 ou 6 dígitos. Retorna `null` se inválido.
 */
export function normalizeHex(value: string): string | null {
  const match = HEX_RE.exec(value.trim());
  if (!match) return null;

  const digits = match[1]!.toLowerCase();
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((char) => char + char)
          .join('')
      : digits;

  return `#${full}`;
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

/** `#rrggbb` -> `r g b` (formato aceito por `rgb(var(--x) / alpha)`). */
export function hexToRgbChannels(hex: string): string | null {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r} ${rgb.g} ${rgb.b}` : null;
}

/** Luminância relativa conforme WCAG 2.1. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number): number => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Razão de contraste WCAG entre duas cores hex. Retorna `null` se alguma for inválida. */
export function contrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

/** `true` quando a cor é escura o bastante para pedir texto claro por cima. */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return relativeLuminance(rgb) < 0.4;
}

/* ---------------------------------------------------------------------------
   Cor que serve fundo claro e fundo escuro
   --------------------------------------------------------------------------- */

/**
 * Extremos usados como referência: o branco de uma página clara e o `#191919`
 * que o Notion escuro pinta. Um embed transparente pode cair em qualquer um
 * dos dois, e não há como saber qual de dentro de um iframe de outra origem.
 */
export const LIGHT_HOST = '#ffffff';
export const DARK_HOST = '#191919';

/**
 * Faixa de luminância relativa em que o contraste contra os dois hosts se
 * equilibra. O ponto de igualdade é ~0.20, onde ambos batem 4.19:1 — o teto
 * matemático para uma cor só. A faixa em volta dele mantém ambos acima de 3:1,
 * mínimo do WCAG para texto grande, que é o caso dos dígitos.
 */
const SAFE_LUMINANCE = { min: 0.16, max: 0.25 } as const;

/** `true` quando a cor lê contra branco e contra `#191919` ao mesmo tempo. */
export function isDualToneSafe(hex: string): boolean {
  const light = contrastRatio(hex, LIGHT_HOST);
  const dark = contrastRatio(hex, DARK_HOST);
  if (light == null || dark == null) return false;
  return light >= 3 && dark >= 3;
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === red) h = ((green - blue) / delta) % 6;
  else if (max === green) h = (blue - red) / delta + 2;
  else h = (red - green) / delta + 4;

  return { h: ((h * 60) % 360 + 360) % 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Reposiciona a cor na faixa que lê nos dois fundos, mexendo só na claridade.
 *
 * Matiz e saturação são preservados de propósito: a escolha de cor é do
 * usuário, o que não serve é a claridade dela. `#852323` tem 9.3:1 sobre branco
 * e 1.9:1 sobre `#191919` — vira um vermelho-tijolo da mesma família que serve
 * aos dois. Cor já dentro da faixa volta intacta; hex inválido devolve `null`,
 * mesmo contrato de `normalizeHex`.
 *
 * A busca é binária porque, com matiz e saturação fixos, a luminância cresce
 * monotonicamente com a claridade do HSL — não há mínimo local para escapar.
 */
export function toDualToneSafe(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const luminance = relativeLuminance(rgb);
  if (luminance >= SAFE_LUMINANCE.min && luminance <= SAFE_LUMINANCE.max) {
    return normalizeHex(hex);
  }

  const { h, s } = rgbToHsl(rgb);
  const target = 0.2;
  let low = 0;
  let high = 1;
  let result = rgb;

  // 24 passos levam o intervalo bem abaixo de um degrau de 1/255 em cada canal.
  for (let step = 0; step < 24; step += 1) {
    const mid = (low + high) / 2;
    result = hslToRgb(h, s, mid);
    if (relativeLuminance(result) < target) low = mid;
    else high = mid;
  }

  return toHex(result);
}
