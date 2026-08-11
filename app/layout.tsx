import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/theme/fonts';
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from '@/lib/site';
import './globals.css';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — contagem regressiva para o Notion`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'countdown',
    'contagem regressiva',
    'notion',
    'widget',
    'embed',
    'timer',
    'cronômetro',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — contagem regressiva para o Notion`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — contagem regressiva para o Notion`,
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
