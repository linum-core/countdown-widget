import { SKIN_CLASS } from '@/lib/theme/tokens';
import { TimeUnit } from '../TimeUnit';
import { WidgetHeader } from '../WidgetHeader';
import type { LayoutProps } from './types';

/** Uma caixa por unidade, respeitando `radius` e `skin`. */
export function CardsLayout({ config, parts, units }: LayoutProps) {
  const surfaceClass = ['cd-surface', SKIN_CLASS[config.skin]].filter(Boolean).join(' ');

  return (
    <>
      <WidgetHeader emoji={config.emoji} title={config.title} subtitle={config.subtitle} />
      {/*
        `gap` reduzido e caixas estreitas: com quatro unidades, a diferença
        decide se tudo cabe em uma linha dentro de um bloco estreito do Notion.
      */}
      <div
        className="flex flex-wrap items-stretch justify-center"
        style={{ gap: 'calc(var(--cd-gap) * 0.7)' }}
      >
        {units.map((unit) => (
          <TimeUnit
            key={unit}
            unit={unit}
            value={parts[unit]}
            label={config.labels[unit]}
            animation={config.animation}
            icons={config.icons}
            className={`${surfaceClass} justify-center`}
            style={{
              padding: 'calc(var(--cd-value-size) * 0.26) calc(var(--cd-value-size) * 0.3)',
              minWidth: 'calc(var(--cd-value-size) * 1.6)',
            }}
          />
        ))}
      </div>
    </>
  );
}
