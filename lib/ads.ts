/*
  Publicidade vive só na homepage. O widget (`/w`) roda dentro de um iframe do
  Notion e não carrega nada de terceiros — por isso nenhum destes helpers é
  importado por `app/layout.tsx`, que é compartilhado pelas duas rotas.
*/

/**
 * ID do publisher AdSense (`ca-pub-…`). Sem a variável — ou com um valor
 * malformado — os anúncios simplesmente não existem: nenhum script é baixado e
 * nenhum slot é renderizado. É o estado padrão em desenvolvimento e nos testes.
 */
export function getAdsenseClient(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  return raw && /^ca-pub-\d+$/.test(raw) ? raw : null;
}

/**
 * IDs das unidades criadas no painel do AdSense. Cada slot é opcional: um slot
 * ausente apaga só o anúncio correspondente, o que permite ligar os blocos aos
 * poucos enquanto a conta é aprovada.
 *
 * O acesso a `process.env.X` precisa ser literal — o Next substitui a expressão
 * inteira no build, e uma indexação dinâmica não seria reescrita.
 */
export const AD_SLOTS = {
  railLeft: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL_LEFT,
  railRight: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL_RIGHT,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
} as const;
