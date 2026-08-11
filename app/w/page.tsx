import type { Metadata } from 'next';
import { Countdown } from '@/components/countdown/Countdown';
import { parseConfig, type RawSearchParams } from '@/lib/config/parse';
import { serializeConfig } from '@/lib/config/serialize';

interface WidgetPageProps {
  searchParams: Promise<RawSearchParams>;
}

/** Nome do evento, usado no título da aba e embaixo do ícone instalado. */
function widgetName(title: string): string {
  return title || 'Contagem regressiva';
}

/**
 * Metadata derivada da URL.
 *
 * Existe sobretudo para o widget instalado na tela de início do iPhone ou no
 * Dock do macOS: sem um `manifest` próprio, o atalho herdaria o da raiz e abriria
 * a homepage. `title.absolute` evita o sufixo do template do layout raiz — o
 * nome do atalho deve ser só o do evento.
 */
export async function generateMetadata({ searchParams }: WidgetPageProps): Promise<Metadata> {
  const config = parseConfig(await searchParams);
  const query = serializeConfig(config);
  const name = widgetName(config.title);

  return {
    title: { absolute: name },
    // A página do widget é uma superfície de embed, não conteúdo para busca.
    robots: { index: false, follow: false },
    manifest: query ? `/w/manifest?${query}` : '/w/manifest',
    appleWebApp: { capable: true, title: name, statusBarStyle: 'default' },
    /*
      O Next emite só o `mobile-web-app-capable` padronizado, que o iOS passou a
      entender tarde. A meta legada garante a tela cheia em iPhone mais antigo.
    */
    other: { 'apple-mobile-web-app-capable': 'yes' },
  };
}

/**
 * Página do widget.
 *
 * Server Component fino: a única coisa que acontece no servidor é o parse dos
 * parâmetros. O objeto tipado resultante cruza a fronteira para a ilha client,
 * de modo que nenhuma lógica de parsing entra no bundle do navegador.
 */
export default async function WidgetPage({ searchParams }: WidgetPageProps) {
  const config = parseConfig(await searchParams);

  return (
    /*
      `fixed inset-0` amarra o widget exatamente ao viewport do iframe: com
      `min-height` o conteúdo empurraria o documento e o Notion mostraria uma
      barra de rolagem dentro do bloco — o detalhe que mais denuncia um embed.
      A cor de fundo vive aqui, e não no widget, para cobrir toda a área do
      iframe em vez de apenas a caixa do conteúdo.

      O padding de área segura é zero no Notion e só ganha valor em tela cheia
      no iPhone, onde o notch e o indicador inferior invadiriam o conteúdo.
    */
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        ...(config.background === 'transparent' ? {} : { backgroundColor: config.background }),
        paddingTop: 'env(safe-area-inset-top)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
      }}
    >
      <Countdown config={config} />
    </div>
  );
}
