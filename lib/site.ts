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
export const SITE_DESCRIPTION =
  'Contagem regressiva minimalista, configurável por URL e pronta para embutir no Notion. Sem conta, sem rastreio, fundo transparente.';
