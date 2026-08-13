import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/theme/fonts';
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, getSiteUrl } from '@/lib/site';
import './globals.css';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  /*
    A raiz é também o link de edição: a configuração inteira viaja na query
    string, então cada contagem compartilhada é uma URL distinta com o mesmo
    conteúdo. Sem canonical, isso é um caso-livro de conteúdo duplicado, e o
    buscador escolheria sozinho qual versão indexar.
  */
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sem isto o Google limita a miniatura e o trecho exibidos no resultado.
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Números longos viram links de telefone no Safari do iOS; a contagem não é telefone.
  formatDetection: { telephone: false, date: false, address: false, email: false },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // O fundo transparente do widget exige que o host controle a cor; por isso
  // nenhum `themeColor` fixo é declarado aqui.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${fontVariables} bg-transparent antialiased`}>{children}</body>
    </html>
  );
}
