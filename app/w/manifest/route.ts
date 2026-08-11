import type { MetadataRoute } from 'next';
import { parseConfig } from '@/lib/config/parse';
import { serializeConfig } from '@/lib/config/serialize';

/**
 * Manifest do widget, derivado da própria URL.
 *
 * O manifest da raiz (`app/manifest.ts`) declara `start_url: '/'`, e o Safari
 * honra esse campo ao "Adicionar à Tela de Início" — um atalho do widget abriria
 * a homepage do gerador. Servir um manifest por configuração resolve: o atalho
 * volta para exatamente a contagem que estava na tela, com o nome do evento.
 */
/**
 * Rótulo embaixo do ícone. A tela de início corta em torno de 12 caracteres,
 * então um título longo vira só a primeira palavra — "Casamento" lê melhor que
 * "Casamento M…".
 */
function shortName(name: string): string {
  return name.length > 12 ? (name.split(' ')[0] ?? name) : name;
}

export function GET(request: Request): Response {
  const config = parseConfig(new URL(request.url).searchParams);
  const query = serializeConfig(config);
  const name = config.title || 'Contagem regressiva';

  const manifest: MetadataRoute.Manifest = {
    name,
    short_name: shortName(name),
    start_url: query ? `/w?${query}` : '/w',
    // Fora do `/w` o app instalado não tem o que mostrar.
    scope: '/w',
    display: 'standalone',
    lang: 'pt-BR',
    // Ícone único em SVG: o iOS ignora o manifest e usa o `apple-touch-icon`.
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };

  /*
    Sem `background_color` quando o fundo é transparente: a splash ficaria presa
    numa cor fixa, enquanto a página segue o tema do sistema.
  */
  if (config.background !== 'transparent') {
    manifest.background_color = config.background;
    manifest.theme_color = config.background;
  }

  return Response.json(manifest, {
    headers: { 'content-type': 'application/manifest+json' },
  });
}
