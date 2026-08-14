/** Origem pública do site, usada por metadata, sitemap e pelo gerador de URLs. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Preenchida automaticamente pela Vercel em previews e produção.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const SITE_NAME = 'Countdown Widget';

/**
 * Título das buscas e das abas.
 *
 * Começa pelo que se procura — "contagem regressiva para Notion" — e não pelo
 * nome do produto, que ninguém digita. Cabe nos ~60 caracteres que o Google
 * mostra antes de cortar.
 */
export const SITE_TITLE = 'Contagem regressiva para Notion — widget grátis';

/** Meta description. Fica em ~150 caracteres, o que o Google exibe sem truncar. */
export const SITE_DESCRIPTION =
  'Crie uma contagem regressiva grátis para embutir no Notion. Configure pelo gerador, copie a URL e cole em /embed. Sem conta, sem rastreio, fundo transparente.';

/** Frase curta de apoio, usada na homepage e na imagem social. */
export const SITE_TAGLINE = 'Contagem regressiva minimalista, configurável por URL.';

export const SITE_KEYWORDS = [
  'contagem regressiva notion',
  'countdown notion',
  'widget notion',
  'contador regressivo',
  'widget contagem regressiva',
  'notion embed',
  'contagem regressiva casamento',
  'countdown timer',
];
