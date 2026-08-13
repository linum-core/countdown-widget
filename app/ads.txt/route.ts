import { getAdsenseClient } from '@/lib/ads';

/*
  `ads.txt` precisa carregar o ID do publisher, que vive numa variável de
  ambiente — um arquivo estático em `public/` não conseguiria lê-la. Como route
  handler, o arquivo nasce do mesmo helper que liga os anúncios: sem publisher
  configurado, a rota não existe.
*/
export function GET() {
  const client = getAdsenseClient();
  if (!client) return new Response('Not Found', { status: 404 });

  // O crawler espera `pub-…`; o prefixo `ca-` é só da tag do AdSense.
  const publisher = client.replace(/^ca-/, '');

  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
