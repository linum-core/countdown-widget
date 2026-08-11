import { TimeUnit } from '../TimeUnit';
import { WidgetHeader } from '../WidgetHeader';
import type { LayoutProps } from './types';

/** Layout padrão: sem molduras, apenas tipografia sobre o fundo do host. */
export function MinimalLayout({ config, parts, units }: LayoutProps) {
  return (
    <>
      <WidgetHeader emoji={config.emoji} title={config.title} subtitle={config.subtitle} />
      <div
        className="flex flex-wrap items-start justify-center"
        style={{ gap: 'calc(var(--cd-gap) * 1.6)' }}
      >
        {units.map((unit) => (
          <TimeUnit
            key={unit}
            unit={unit}
            value={parts[unit]}
            label={config.labels[unit]}
            animation={config.animation}
            icons={config.icons}
          />
        ))}
      </div>
    </>
  );
}
