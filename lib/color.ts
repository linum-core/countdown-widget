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
