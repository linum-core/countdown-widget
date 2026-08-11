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

export const FONT_STACK: Record<FontKey, string> = {
  inter: `var(--font-inter), ${SYSTEM_STACK}`,
  poppins: `var(--font-poppins), ${SYSTEM_STACK}`,
  manrope: `var(--font-manrope), ${SYSTEM_STACK}`,
  geist: `var(--font-geist), ${SYSTEM_STACK}`,
  system: SYSTEM_STACK,
};
