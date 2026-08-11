import type { FontKey } from '@/types/widget';

/**
 * Pilhas de `font-family` por fonte suportada.
 *
 * Vive separado de `fonts.ts` de propósito: aquele módulo chama `next/font`,
 * que só existe dentro do pipeline de build do Next. Mantendo aqui apenas
 * strings, os componentes e os testes podem importar o mapeamento sem arrastar
 * o carregador de fontes junto.
 */
const SYSTEM_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** Fallbacks das serifadas e da cursiva: cair numa sans-serif descaracterizaria o texto. */
const SERIF_STACK = 'ui-serif, Georgia, Cambria, "Times New Roman", serif';
const SCRIPT_STACK = `"Segoe Script", "Brush Script MT", "Apple Chancery", cursive, ${SERIF_STACK}`;

export const FONT_STACK: Record<FontKey, string> = {
  inter: `var(--font-inter), ${SYSTEM_STACK}`,
  poppins: `var(--font-poppins), ${SYSTEM_STACK}`,
  manrope: `var(--font-manrope), ${SYSTEM_STACK}`,
  geist: `var(--font-geist), ${SYSTEM_STACK}`,
  playfair: `var(--font-playfair), ${SERIF_STACK}`,
  greatvibes: `var(--font-great-vibes), ${SCRIPT_STACK}`,
  system: SYSTEM_STACK,
};
