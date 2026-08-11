import type { CSSProperties } from 'react';
import { hexToRgbChannels, isDarkColor } from '@/lib/color';
import { FONT_STACK } from '@/lib/theme/font-stack';
import type { Size, WidgetConfig } from '@/types/widget';

/**
 * Tradução de `WidgetConfig` para CSS custom properties.
 *
 * O estilo do widget é dirigido por variáveis aplicadas inline no elemento raiz,
 * e não por classes montadas dinamicamente: o compilador do Tailwind só enxerga
 * classes literais no código-fonte, então `bg-[${cor}]` simplesmente não existiria
 * no CSS final. Variáveis contornam isso e ainda permitem que o tema `auto`
 * seja resolvido puramente em CSS, sem JavaScript e sem flash na primeira pintura.
 */

/** Escala tipográfica por tamanho: [mínimo, preferido em cqi, máximo] em rem/cqi. */
const SIZE_SCALE: Record<Size, { value: string; label: string; title: string; gap: string }> = {
  small: {
    value: 'clamp(1.35rem, 9cqi, 2.4rem)',
    label: 'clamp(0.5rem, 2.1cqi, 0.68rem)',
    title: 'clamp(0.75rem, 3.4cqi, 1rem)',
    gap: 'clamp(0.5rem, 2.4cqi, 0.9rem)',
  },
  medium: {
    value: 'clamp(1.9rem, 13cqi, 4rem)',
    label: 'clamp(0.6rem, 2.7cqi, 0.82rem)',
    title: 'clamp(0.95rem, 4.4cqi, 1.5rem)',
    gap: 'clamp(0.7rem, 3.4cqi, 1.4rem)',
  },
  large: {
    value: 'clamp(2.6rem, 17cqi, 6rem)',
    label: 'clamp(0.7rem, 3.2cqi, 1rem)',
    title: 'clamp(1.15rem, 5.4cqi, 2.1rem)',
    gap: 'clamp(0.9rem, 4.2cqi, 2rem)',
  },
};

/**
 * Paletas base de cada tema. O tema `auto` é resolvido em CSS via media query.
 *
 * `surface` são canais RGB de uma *sobreposição* (`rgb(var(--cd-surface) / 0.05)`),
 * não uma cor de fundo: no tema claro a caixa escurece o que está atrás, no
 * escuro ela clareia. Por isso os valores são invertidos em relação ao `fg`.
 */
const PALETTE = {
  light: { fg: '#111111', muted: '#6b6b6b', surface: '0 0 0' },
  dark: { fg: '#f5f5f5', muted: '#a1a1a1', surface: '255 255 255' },
} as const;

/** Variáveis próprias do widget; o prefixo evita colisão com qualquer host. */
export interface WidgetStyle extends CSSProperties {
  '--cd-fg'?: string;
  '--cd-muted'?: string;
  '--cd-number'?: string;
  '--cd-title-font'?: string;
  '--cd-title-color'?: string;
  '--cd-label-color'?: string;
  '--cd-surface'?: string;
  '--cd-accent'?: string;
  '--cd-radius'?: string;
  '--cd-value-size'?: string;
  '--cd-label-size'?: string;
  '--cd-title-size'?: string;
  '--cd-gap'?: string;
}

/**
 * Deriva o pacote de estilo do widget.
 *
 * Quando `theme` é `auto`, as cores de texto são deixadas de fora do inline
 * style para que a media query de `globals.css` possa assumir. Uma cor explícita
 * via `color=` sempre vence, em qualquer tema.
 */
export function buildWidgetStyle(config: WidgetConfig): WidgetStyle {
  const scale = SIZE_SCALE[config.size];
  const style: WidgetStyle = {
    fontFamily: FONT_STACK[config.font],
    '--cd-radius': `${config.radius}px`,
    '--cd-value-size': scale.value,
    '--cd-label-size': scale.label,
    '--cd-title-size': scale.title,
    '--cd-gap': scale.gap,
  };

  // A variável só existe quando o título realmente diverge; sem ela o CSS herda.
  if (config.titleFont && config.titleFont !== config.font) {
    style['--cd-title-font'] = FONT_STACK[config.titleFont];
  }

  if (config.theme !== 'auto') {
    const palette = PALETTE[config.theme];
    style['--cd-fg'] = palette.fg;
    style['--cd-muted'] = palette.muted;
    style['--cd-surface'] = palette.surface;
  }

  // Com fundo sólido, a superfície dos cards acompanha a luminosidade escolhida.
  if (config.background !== 'transparent') {
    style.backgroundColor = config.background;
    style['--cd-surface'] = isDarkColor(config.background) ? '255 255 255' : '0 0 0';

    if (config.theme === 'auto') {
      const palette = isDarkColor(config.background) ? PALETTE.dark : PALETTE.light;
      style['--cd-fg'] = palette.fg;
      style['--cd-muted'] = palette.muted;
    }
  }

  if (config.color) {
    style['--cd-fg'] = config.color;
    style['--cd-muted'] = config.color;
    style['--cd-accent'] = hexToRgbChannels(config.color) ?? undefined;
  }

  // Cores por papel vencem a cor base: são o ajuste mais específico da URL.
  if (config.numberColor) {
    style['--cd-number'] = config.numberColor;
    // O brilho do skin `neon` é do dígito, então acompanha a cor dele.
    style['--cd-accent'] = hexToRgbChannels(config.numberColor) ?? style['--cd-accent'];
  }
  if (config.titleColor) style['--cd-title-color'] = config.titleColor;
  if (config.labelColor) style['--cd-label-color'] = config.labelColor;

  return style;
}

/** Classes utilitárias aplicadas conforme o `skin`, compartilhadas pelos layouts. */
export const SKIN_CLASS = {
  flat: '',
  glass: 'cd-glass',
  neon: 'cd-neon',
} as const;
