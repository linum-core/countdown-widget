import { Countdown } from '@/components/countdown/Countdown';
import { parseConfig, type RawSearchParams } from '@/lib/config/parse';

interface WidgetPageProps {
  searchParams: Promise<RawSearchParams>;
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
    */
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={
        config.background === 'transparent' ? undefined : { backgroundColor: config.background }
      }
    >
      <Countdown config={config} />
    </div>
  );
}
