'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { activeUnits, buildAriaLabel } from '@/lib/format';
import { FONT_STACK } from '@/lib/theme/font-stack';
import { buildWidgetStyle } from '@/lib/theme/tokens';
import { computeProgress } from '@/lib/time/diff';
import type { WidgetConfig } from '@/types/widget';
import { EndedMessage } from './EndedMessage';
import { MissingTarget } from './MissingTarget';
import { ProgressBar } from './ProgressBar';
import { CardsLayout } from './layouts/CardsLayout';
import { CircularLayout } from './layouts/CircularLayout';
import { HorizontalLayout } from './layouts/HorizontalLayout';
import { MinimalLayout } from './layouts/MinimalLayout';
import type { LayoutProps } from './layouts/types';

const LAYOUTS: Record<WidgetConfig['layout'], (props: LayoutProps) => React.ReactNode> = {
  minimal: MinimalLayout,
  horizontal: HorizontalLayout,
  cards: CardsLayout,
  circular: CircularLayout,
};

interface CountdownProps {
  config: WidgetConfig;
  /** Relógio injetável; usado nos testes para tornar o render determinístico. */
  now?: () => number;
}

/**
 * Orquestrador do widget.
 *
 * É o único componente com estado: calcula o tempo, resolve o tema e escolhe o
 * layout. Os layouts recebem dados prontos e cuidam apenas de apresentação.
 */
export function Countdown({ config, now }: CountdownProps) {
  const parts = useCountdown({ targetMs: config.targetMs, units: config.units, now });
  const units = activeUnits(config.units);
  const Layout = LAYOUTS[config.layout];

  const style = {
    ...buildWidgetStyle(config),
    fontFamily: FONT_STACK[config.font],
  };

  const progress =
    config.progress && config.fromMs != null && config.targetMs != null
      ? computeProgress(config.fromMs, config.targetMs, (now ?? Date.now)())
      : null;

  return (
    <div
      className={`cd-root flex w-full flex-col items-center justify-center px-3 py-2`}
      style={style}
      data-theme={config.theme}
      data-layout={config.layout}
      data-skin={config.skin}
    >
      {config.targetMs == null ? (
        <MissingTarget />
      ) : parts.ended ? (
        <EndedMessage emoji={config.emoji} text={config.endedText} />
      ) : (
        <div
          role="timer"
          aria-live="off"
          aria-label={buildAriaLabel(parts, config.units, config.labels, config.title)}
          className="flex w-full flex-col items-center"
          style={{ gap: 'var(--cd-gap)' }}
          /*
            Servidor e navegador leem o relógio em instantes diferentes, então o
            segundo renderizado pode divergir por um. A divergência é esperada e
            se corrige no primeiro tick; avisar sobre ela apenas poluiria o
            console de quem embute o widget.
          */
          suppressHydrationWarning
        >
          {/*
            Os dígitos ficam ocultos para tecnologias assistivas: a descrição
            completa já está no `aria-label` acima, e anunciar cada segundo
            tornaria o widget inutilizável com leitor de tela.
          */}
          <div
            aria-hidden="true"
            className="flex w-full flex-col items-center"
            style={{ gap: 'var(--cd-gap)' }}
          >
            <Layout config={config} parts={parts} units={units} />
          </div>

          {progress != null ? (
            <div className="w-full" style={{ maxWidth: '28rem' }}>
              <ProgressBar value={progress} label="Progresso até a data-alvo" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
