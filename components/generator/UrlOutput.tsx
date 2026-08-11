'use client';

import { useState } from 'react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/Button';
import { buildStandaloneHtml } from '@/lib/config/serialize';
import type { WidgetConfig } from '@/types/widget';

interface UrlOutputProps {
  url: string;
  embedCode: string;
  /** Endereço que devolve o formulário preenchido, para continuar ou compartilhar. */
  editUrl: string;
  config: WidgetConfig;
  /** Grava tema claro e cores escuras no rascunho, a partir do aviso do Notion. */
  onPinDarkColors: () => void;
}

type Destination = 'notion' | 'device' | 'site';

const DESTINATION_LABELS: Record<Destination, string> = {
  notion: 'Notion',
  device: 'iPhone e Mac',
  site: 'Outros sites',
};

const STEPS: Record<Destination, string[]> = {
  notion: [
    'No Notion, digite /embed e dê Enter.',
    'Cole a URL acima e confirme.',
    'Arraste a borda de baixo do bloco para ajustar a altura.',
  ],
  device: [
    'Abra a URL no Safari — o Chrome do iPhone não instala aplicativos.',
    'iPhone: Compartilhar → Adicionar à Tela de Início.',
    'Mac: Arquivo → Adicionar ao Dock.',
  ],
  site: [
    'Cole o código em qualquer página HTML.',
    'Ou baixe o arquivo pronto para abrir do disco ou hospedar.',
  ],
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink-soft text-xs font-medium tracking-wide uppercase">{label}</span>
        <Button
          variant="outline"
          onClick={() => void copy(value)}
          aria-label={`Copiar ${label.toLowerCase()}`}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <code className="border-rule text-ink-soft block max-h-24 overflow-auto rounded-lg border bg-white/70 p-3 font-mono text-xs leading-relaxed break-all">
        {value}
      </code>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="text-ink-soft flex flex-col gap-2 text-sm leading-relaxed">
      {items.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="text-accent font-mono text-xs tabular-nums">{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function slugify(title: string): string {
  const slug = title
    .normalize('NFD')
    // Acentos viram marcas combinantes após o NFD; some com elas, não com a letra.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'contagem';
}

/**
 * Saída do gerador, separada por destino.
 *
 * O Notion aceita apenas uma URL no bloco `/embed` — colar HTML lá vira texto
 * literal, erro fácil de cometer quando a tela oferece os dois lado a lado sem
 * dizer onde cada um serve.
 */
export function UrlOutput({ url, embedCode, editUrl, config, onPinDarkColors }: UrlOutputProps) {
  const [destination, setDestination] = useState<Destination>('notion');

  /*
    Dentro de um iframe de outra origem, o tema automático segue o sistema de
    quem lê, não a página que hospeda. Num Notion claro, leitor com sistema
    escuro recebe texto quase branco sobre branco — o bloco parece vazio.
  */
  const followsReaderSystem =
    config.theme === 'auto' &&
    !config.color &&
    !config.numberColor &&
    !config.titleColor &&
    !config.labelColor;

  const download = (): void => {
    const html = buildStandaloneHtml(url, config.title || 'Contagem regressiva');
    const href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const link = document.createElement('a');

    link.href = href;
    link.download = `${slugify(config.title)}.html`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Onde usar" className="border-rule flex gap-1 border-b">
        {(Object.keys(DESTINATION_LABELS) as Destination[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`aba-${key}`}
            aria-selected={destination === key}
            aria-controls={`painel-${key}`}
            onClick={() => setDestination(key)}
            className={[
              'focus-visible:outline-accent -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              destination === key
                ? 'border-ink text-ink'
                : 'text-ink-faint hover:text-ink-soft border-transparent',
            ].join(' ')}
          >
            {DESTINATION_LABELS[key]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`painel-${destination}`}
        aria-labelledby={`aba-${destination}`}
        className="flex flex-col gap-4"
      >
        {destination === 'site' ? (
          <CopyRow label="Código embed" value={embedCode} />
        ) : (
          <CopyRow label="URL do widget" value={url} />
        )}

        {destination === 'notion' && followsReaderSystem ? (
          <div className="border-accent/30 bg-accent/[0.06] flex flex-col gap-3 rounded-lg border p-3">
            <p className="text-ink-soft text-sm leading-relaxed">
              Sem cor fixa, o embed segue o sistema de quem abre — não o tema da página. Num Notion
              claro, quem estiver com o aparelho no escuro vê o bloco vazio.
            </p>
            <Button variant="outline" className="self-start" onClick={onPinDarkColors}>
              Fixar cores escuras
            </Button>
          </div>
        ) : null}

        {destination === 'notion' ? (
          <p className="text-ink-faint text-sm leading-relaxed">
            O Notion não aceita código HTML no bloco de embed: cole a URL, não o{' '}
            <code className="bg-ink/[0.06] rounded px-1 py-0.5 font-mono text-xs">
              &lt;iframe&gt;
            </code>
            .
          </p>
        ) : null}

        <Steps items={STEPS[destination]} />

        {destination === 'site' ? (
          <Button variant="outline" className="self-start" onClick={download}>
            Baixar .html
          </Button>
        ) : null}
      </div>

      {/*
        Fora das abas de propósito: as três publicam a contagem, esta devolve o
        formulário. Confundir as duas coisas colocaria HTML dentro do Notion.
      */}
      <div className="border-rule flex flex-col gap-2 border-t pt-5">
        <CopyRow label="Link de edição" value={editUrl} />
        <p className="text-ink-faint text-sm leading-relaxed">
          Abre este formulário preenchido — para retomar depois ou passar a alguém.
        </p>
      </div>
    </div>
  );
}
