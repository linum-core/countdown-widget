import type { Metadata } from 'next';
import Link from 'next/link';
import { ConsentReset } from '@/components/ads/ConsentReset';

export const metadata: Metadata = {
  title: 'Privacidade',
  description:
    'O que o Countdown Widget guarda, o que os anúncios do Google usam e como refazer a escolha sobre cookies.',
};

interface Section {
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    title: 'A contagem vive na URL',
    body: (
      <>
        Data, textos e cores são lidos dos parâmetros do endereço e montados na hora. Não existe
        conta, banco de dados nem formulário enviado a um servidor: compartilhar a URL é a única
        forma de a configuração sair do seu navegador.
      </>
    ),
  },
  {
    title: 'O widget não carrega terceiros',
    body: (
      <>
        A página <code className="bg-ink/[0.06] rounded px-1 py-0.5 font-mono text-xs">/w</code>,
        que é a embutida no Notion, não tem anúncios nem qualquer script externo — nem quando os
        anúncios estão ativos aqui. As fontes são servidas pelo próprio site, resolvidas no build.
      </>
    ),
  },
  {
    title: 'Anúncios do Google nesta página',
    body: (
      <>
        A homepage exibe anúncios do Google AdSense. O Google e seus parceiros podem usar cookies
        para medir e personalizar o que é exibido. No Espaço Econômico Europeu, no Reino Unido e na
        Suíça, o consentimento é pedido pela mensagem do próprio Google (uma CMP certificada), com
        as opções “Consentir”, “Não consentir” e “Gerenciar opções”; recusar não apaga os anúncios,
        que passam a ser não&#8209;personalizados.
      </>
    ),
  },
  {
    title: 'O que fica guardado no seu navegador',
    body: (
      <>
        Este site não guarda nada: a configuração da contagem viaja na URL e nenhum dado é enviado a
        um servidor nosso. A decisão sobre cookies, quando a mensagem de consentimento se aplica, é
        registrada pela CMP do Google no seu navegador — e pode ser revista abaixo.
      </>
    ),
  },
];

export default function PrivacidadePage() {
  return (
    <main className="bg-paper text-ink min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
        <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase">
          Countdown Widget
        </p>
        <h1 className="mt-4 text-4xl leading-[1] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          Privacidade
        </h1>

        <div className="mt-12 flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.title} className="border-rule border-t pt-6">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="text-ink-soft mt-3 text-base leading-relaxed">{section.body}</p>
            </section>
          ))}

          <section className="border-rule border-t pt-6">
            <h2 className="text-xl font-semibold tracking-tight">Mudar de ideia</h2>
            <p className="text-ink-soft mt-3 text-base leading-relaxed">
              Onde a mensagem de consentimento do Google se aplica, o botão abaixo a reabre para
              você trocar a decisão. Fora dessas regiões não há escolha registrada, e o botão não
              aparece. Para detalhes de como o Google trata os dados, veja a{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                className="text-ink underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                política de parceiros do Google
              </a>
              .
            </p>
            <div className="mt-5">
              <ConsentReset />
            </div>
          </section>
        </div>

        <footer className="border-rule text-ink-faint mt-16 border-t pt-8 text-sm">
          <Link href="/" className="hover:text-ink underline underline-offset-4">
            Voltar ao gerador
          </Link>
        </footer>
      </div>
    </main>
  );
}
