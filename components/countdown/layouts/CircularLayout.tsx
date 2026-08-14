import { SKIN_CLASS } from '@/lib/theme/tokens';
import type { UnitKey } from '@/types/widget';
import { AnimatedNumber } from '../AnimatedNumber';
import { WidgetHeader } from '../WidgetHeader';
import type { LayoutProps } from './types';

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Escala natural de cada unidade, usada para desenhar a fração do anel. */
const UNIT_MAX: Record<UnitKey, number> = {
  months: 12,
  // Com meses ligados, o dia nunca passa de 31; o anel de 365 é para quando não.
  days: 365,
  hours: 24,
  minutes: 60,
  seconds: 60,
};

/** Fração preenchida do anel, sempre em [0, 1]. */
function ringFraction(unit: UnitKey, value: number): number {
  const max = UNIT_MAX[unit];
  return Math.min(1, Math.max(0, (value % max || (value > 0 ? max : 0)) / max));
}

/**
 * Um anel SVG por unidade, com o número ao centro.
 *
 * O anel é puro `stroke-dasharray` — sem canvas, sem biblioteca de gráficos, e
 * animável pela GPU via `transition` de `stroke-dashoffset`.
 */
export function CircularLayout({ config, parts, units }: LayoutProps) {
  const skinClass = SKIN_CLASS[config.skin];

  return (
    <>
      <WidgetHeader emoji={config.emoji} title={config.title} subtitle={config.subtitle} />
      <div className="flex flex-wrap items-start justify-center" style={{ gap: 'var(--cd-gap)' }}>
        {units.map((unit) => {
          const offset = CIRCUMFERENCE * (1 - ringFraction(unit, parts[unit]));

          return (
            <div
              key={unit}
              className={['flex flex-col items-center', skinClass].filter(Boolean).join(' ')}
              style={{ width: 'calc(var(--cd-value-size) * 2.2)' }}
            >
              <div className="relative w-full">
                {/* `color` local faz os dois `currentColor` do anel seguirem o dígito. */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full"
                  style={{ color: 'var(--cd-number)' }}
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    opacity="0.14"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                    // O anel deriva do relógio, que difere entre servidor e navegador.
                    suppressHydrationWarning
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatedNumber
                    value={parts[unit]}
                    animation={config.animation}
                    style={{ fontSize: 'calc(var(--cd-value-size) * 0.62)' }}
                  />
                </div>
              </div>
              <span className="cd-label mt-1">{config.labels[unit]}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
