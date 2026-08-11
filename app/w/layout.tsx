import type { Metadata } from 'next';

export const metadata: Metadata = {
  // A página do widget é uma superfície de embed, não conteúdo para busca.
  robots: { index: false, follow: false },
};

/**
 * Casca do embed: apenas metadata.
 *
 * O enquadramento fica na própria página, que é quem conhece a cor de fundo
 * escolhida na URL e precisa pintá-la em toda a área do iframe.
 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
