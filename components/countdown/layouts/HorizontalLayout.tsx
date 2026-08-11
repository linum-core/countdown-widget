import { UNIT_SUFFIX } from '@/lib/format';
import { AnimatedNumber } from '../AnimatedNumber';
import { WidgetHeader } from '../WidgetHeader';
import type { LayoutProps } from './types';

/**
 * Uma linha só: `💍 Casamento` acima de `458d : 12h : 35m : 41s`.
 *
 * Unidades a partir da segunda recebem zero à esquerda para que a largura do
 * bloco não oscile a cada segundo.
 */
export function HorizontalLayout({ config, parts, units }: LayoutProps) {
  return (
    <>
      <WidgetHeader emoji={config.emoji} title={config.title} subtitle={config.subtitle} inline />
      <div
        className="flex flex-wrap items-baseline justify-center"
        style={{ gap: 'calc(var(--cd-gap) * 0.5)' }}
      >
        {units.map((unit, index) => (
          <span key={unit} className="flex items-baseline" style={{ gap: '0.12em' }}>
            {index > 0 ? (
              <span className="cd-value opacity-30" style={{ marginRight: '0.3em' }} aria-hidden>
                :
              </span>
            ) : null}
            <AnimatedNumber
              value={parts[unit]}
              animation={config.animation}
              pad={index === 0 ? undefined : 2}
            />
            <span className="cd-label" style={{ fontSize: 'calc(var(--cd-value-size) * 0.38)' }}>
              {UNIT_SUFFIX[unit]}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
