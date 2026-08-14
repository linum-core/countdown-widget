import { Suspense } from 'react';
import Link from 'next/link';
import { AdRails } from '@/components/ads/AdRails';
import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { AdSlot } from '@/components/ads/AdSlot';
import { ConsentBanner } from '@/components/ads/ConsentBanner';
import { ConsentProvider } from '@/components/ads/consent';
import { ExampleGallery } from '@/components/home/ExampleGallery';
import { Faq } from '@/components/home/Faq';
import { GeneratorSection } from '@/components/home/GeneratorSection';
import { ParameterTable } from '@/components/home/ParameterTable';
import { StructuredData } from '@/components/home/StructuredData';
import { AD_SLOTS } from '@/lib/ads';
import type { RawSearchParams } from '@/lib/config/parse';
import { SITE_TAGLINE, SITE_NAME, getSiteUrl } from '@/lib/site';

interface HomePageProps {
  searchParams: Promise<RawSearchParams>;
}

/*
  `searchParams` chega como promessa e é repassada sem `await`: quem espera por
  ela é o `GeneratorSection`, dentro do `Suspense`. É isso que mantém o casco da
  página estático — e a metadata no `<head>`, e não transmitida para dentro do
  `<body>` como acontece em rota dinâmica.
*/
export default function HomePage({ searchParams }: HomePageProps) {
  const siteUrl = getSiteUrl();

  /*
    Os anúncios existem só aqui. O widget herda o mesmo `app/layout.tsx`, então
    nada disto pode subir para o layout raiz: dentro do iframe do Notion um
    anúncio quebraria o embed e violaria a política do AdSense.
  */
  return (
    <ConsentProvider>
      <AdSenseScript />
      <AdRails />
      <main className="bg-paper text-ink min-h-dvh">
        <StructuredData siteUrl={siteUrl} />

        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:py-24">
          <header className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
                Widget para Notion
              </p>
              <h1 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
                Contagem regressiva para o Notion
              </h1>
            </div>
            <p className="text-ink-soft max-w-md text-base leading-relaxed text-pretty">
              {SITE_TAGLINE} Monte a contagem abaixo, copie a URL e cole no Notion com{' '}
              <code className="bg-ink/[0.06] rounded px-1.5 py-0.5 font-mono text-sm">/embed</code>.
              Sem conta, sem rastreio e com fundo transparente.
            </p>
          </header>

          <hr className="border-rule my-14" />

          <section aria-labelledby="gerador">
            <h2 id="gerador" className="sr-only">
              Gerador de widget
            </h2>
            <Suspense
              fallback={
                <div
                  className="border-rule min-h-[32rem] animate-pulse rounded-xl border"
                  aria-hidden="true"
                />
              }
            >
              <GeneratorSection searchParams={searchParams} siteUrl={siteUrl} />
            </Suspense>
          </section>

          <hr className="border-rule my-16" />

          <ExampleGallery siteUrl={siteUrl} />

          <hr className="border-rule my-16" />

          <section
            aria-labelledby="como-usar"
            className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]"
          >
            <div>
              <h2 id="como-usar" className="text-3xl font-semibold tracking-tight">
                Como usar
              </h2>
              <p className="text-ink-soft mt-3 text-sm leading-relaxed">
                Três passos, nenhuma conta.
              </p>
              <p className="text-ink-faint mt-4 text-sm leading-relaxed">
                O bloco{' '}
                <code className="bg-ink/[0.06] rounded px-1 py-0.5 font-mono text-xs">/embed</code>{' '}
                do Notion recebe uma URL e não interpreta marcação: o código{' '}
                <code className="bg-ink/[0.06] rounded px-1 py-0.5 font-mono text-xs">
                  &lt;iframe&gt;
                </code>{' '}
                é para outros sites, e um arquivo enviado ao Notion vira anexo, não embed.
              </p>
            </div>
            <ol className="flex flex-col gap-6">
              {[
                'Ajuste a contagem no gerador acima até a prévia ficar do jeito que você quer.',
                'Escolha o destino na saída do gerador e clique em “Copiar”.',
                'No Notion, digite /embed e cole a URL — o bloco não aceita código HTML.',
              ].map((step, index) => (
                <li key={step} className="border-rule flex gap-4 border-t pt-5">
                  <span className="text-accent font-mono text-sm tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-ink-soft text-base leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <hr className="border-rule my-16" />

          <ParameterTable />

          <hr className="border-rule my-16" />

          <Faq />

          <AdSlot
            slot={AD_SLOTS.footer}
            format="auto"
            responsive
            className="mt-16 min-h-[90px]"
            label="Anúncio"
          />

          <footer className="border-rule text-ink-faint mt-20 border-t pt-8 text-sm">
            <p>
              {SITE_NAME} — a configuração vive inteira na URL: nada é enviado a um servidor e o
              widget gerado não carrega scripts de terceiros. Esta página exibe anúncios do Google —{' '}
              <Link href="/privacidade" className="hover:text-ink underline underline-offset-4">
                como isso funciona
              </Link>
              .
            </p>
          </footer>
        </div>
      </main>
      <ConsentBanner />
    </ConsentProvider>
  );
}
