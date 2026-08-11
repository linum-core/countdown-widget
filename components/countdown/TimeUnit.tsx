import type { CSSProperties } from 'react';
import type { Animation, UnitKey } from '@/types/widget';
import { AnimatedNumber } from './AnimatedNumber';
import { UnitIcon } from './UnitIcon';

interface TimeUnitProps {
  unit: UnitKey;
  value: number;
  label: string;
  animation: Animation;
  icons: boolean;
  /** Classes da caixa; os layouts com moldura injetam `cd-surface` aqui. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Bloco `valor + rótulo` de uma unidade. É o átomo compartilhado por todos os
 * layouts — o que muda entre eles é o contêiner, nunca o conteúdo.
 */
export function TimeUnit({
  unit,
  value,
  label,
  animation,
  icons,
  className,
  style,
}: TimeUnitProps) {
  return (
    <div
      className={['flex flex-col items-center', className].filter(Boolean).join(' ')}
      style={style}
    >
      <AnimatedNumber value={value} animation={animation} />
      <span className="cd-label mt-1 flex items-center gap-1">
        {icons ? <UnitIcon unit={unit} /> : null}
        {label}
      </span>
    </div>
  );
}
