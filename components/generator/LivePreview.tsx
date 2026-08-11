'use client';

import { useState } from 'react';
import { Countdown } from '@/components/countdown/Countdown';
import type { Theme, WidgetConfig } from '@/types/widget';

type Backdrop = 'light' | 'dark';

interface LivePreviewProps {
  config: WidgetConfig;
  url: string;
}

/**
 * Prévia do widget.
 *
 * O painel principal renderiza `<Countdown>` diretamente, sem iframe: a
 * atualização é instantânea a cada tecla e não custa nenhuma requisição. O
 * iframe real fica atrás de um botão, montado apenas sob demanda — ele existe
 * para conferir o comportamento dentro do Notion, não para o uso cotidiano.
 */
export function LivePreview({ config, url }: LivePreviewProps) {
  /*
    O fundo segue o tema escolhido: com fundo fixo em claro, escolher o tema
    escuro pintava texto claro sobre branco e parecia que o seletor não tinha
    funcionado.

    O clique no botão continua valendo, mas dura só até a próxima troca de tema
    — inclusive na volta a um tema já visitado. Sobreviver a ela ressuscitaria a
    combinação ilegível muito depois do clique, sem ninguém relacionar as duas
    coisas. O reset acontece no render, e não num efeito, para o fundo nunca
    aparecer um quadro atrasado em relação ao tema.
  */
  const [override, setOverride] = useState<Backdrop | null>(null);
  const [lastTheme, setLastTheme] = useState<Theme>(config.theme);
  const [showIframe, setShowIframe] = useState(false);

  if (lastTheme !== config.theme) {
    setLastTheme(config.theme);
    setOverride(null);
  }

  // `auto` na prévia não tem como seguir o sistema de quem vai ler o embed.
  const followed: Backdrop = config.theme === 'auto' ? 'light' : config.theme;
  const backdrop = override ?? followed;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-ink-soft text-xs font-medium tracking-wide uppercase">Prévia</span>
        <div className="border-rule flex items-center gap-1 rounded-full border p-0.5">
          {(['light', 'dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setOverride(option)}
              aria-pressed={backdrop === option}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                backdrop === option ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink',
              ].join(' ')}
            >
              {option === 'light' ? 'Página clara' : 'Página escura'}
            </button>
          ))}
        </div>
      </div>

      {/*
        O fundo alternável é o teste visual de `background=transparent`: se
        aparecer um retângulo em volta do widget, a transparência quebrou.
      */}
      <div
        className="border-rule flex min-h-56 items-center justify-center rounded-xl border p-4"
        style={{ backgroundColor: backdrop === 'dark' ? '#191919' : '#ffffff' }}
      >
        <Countdown config={config} />
      </div>

      {showIframe ? (
        <iframe
          src={url}
          title="Prévia do embed"
          width="100%"
          height={220}
          className="border-rule rounded-xl border"
          style={{ background: 'transparent' }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowIframe(true)}
          className="text-ink-soft hover:text-ink self-start text-xs underline underline-offset-4"
        >
          Carregar o embed real em um iframe
        </button>
      )}
    </div>
  );
}
