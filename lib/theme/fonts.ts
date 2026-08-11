import { Geist, Great_Vibes, Inter, Manrope, Playfair_Display, Poppins } from 'next/font/google';

/**
 * Fontes auto-hospedadas pelo `next/font`.
 *
 * O download acontece no build e os arquivos são servidos pelo próprio domínio:
 * em runtime não há nenhuma requisição ao Google, o que atende ao requisito de
 * "nenhuma chamada externa" e elimina o salto de layout típico de webfonts.
 *
 * Apenas a Inter é pré-carregada — é o default. As demais só são baixadas pelo
 * navegador se a URL do widget realmente pedir por elas, porque o `@font-face`
 * é declarado mas nenhuma regra o aplica até `font-family` apontar para a
 * variável correspondente.
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-poppins',
});

export const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-manrope',
});

export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-geist',
});

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair',
});

/** Cursiva de convite. Só tem o peso 400 — não existe versão negrito. */
export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-great-vibes',
});

/** Variáveis de todas as fontes, aplicadas uma única vez no `<body>`. */
export const fontVariables = [
  inter.variable,
  poppins.variable,
  manrope.variable,
  geist.variable,
  playfair.variable,
  greatVibes.variable,
].join(' ');
