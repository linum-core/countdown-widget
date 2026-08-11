import { redirect } from 'next/navigation';
import { GeneratorForm } from '@/components/generator/GeneratorForm';
import { ParameterTable } from '@/components/home/ParameterTable';
import { ExampleGallery } from '@/components/home/ExampleGallery';
import type { RawSearchParams } from '@/lib/config/parse';
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from '@/lib/site';

interface HomePageProps {
  searchParams: Promise<RawSearchParams>;
}

/** Reescreve `?target=...` recebido na raiz para a rota real do widget. */
function widgetRedirect(params: RawSearchParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    query.set(key, Array.isArray(value) ? (value[0] ?? '') : value);
  }
  return `/w?${query.toString()}`;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Links antigos apontando para a raiz continuam funcionando como widget.
  if (params.target ?? params.date ?? params.t) {
    redirect(widgetRedirect(params));
  }

  const siteUrl = getSiteUrl();

  return (
    <main className="bg-paper text-ink min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:py-24">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
              Widget para Notion
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
              {SITE_NAME}
            </h1>
          </div>
          <p className="text-ink-soft max-w-md text-base leading-relaxed text-pretty">
            {SITE_DESCRIPTION} Monte a contagem abaixo, copie a URL e cole no Notion com{' '}
            <code className="bg-ink/[0.06] rounded px-1.5 py-0.5 font-mono text-sm">/embed</code>.
          </p>
        </header>

        <hr className="border-rule my-14" />

        <section aria-labelledby="gerador">
          <h2 id="gerador" className="sr-only">
            Gerador de widget
          </h2>
          <GeneratorForm siteUrl={siteUrl} />
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
          </div>
          <ol className="flex flex-col gap-6">
            {[
              'Ajuste a contagem no gerador acima até a prévia ficar do jeito que você quer.',
              'Clique em “Copiar” na URL do widget.',
              'No Notion, digite /embed, cole a URL e ajuste a altura do bloco.',
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

        <footer className="border-rule text-ink-faint mt-20 border-t pt-8 text-sm">
          <p>
            Sem cookies, sem rastreio e sem chamadas externas. A configuração vive inteira na URL.
          </p>
        </footer>
      </div>
    </main>
  );
}
