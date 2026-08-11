import type { CSSProperties } from 'react';
import { padValue } from '@/lib/time/diff';
import type { Animation } from '@/types/widget';

const ANIMATION_CLASS: Record<Animation, string> = {
  fade: 'cd-anim-fade',
  slide: 'cd-anim-slide',
  flip: 'cd-anim-flip',
  none: '',
};

interface AnimatedNumberProps {
  value: number;
  animation: Animation;
  /** Mínimo de dígitos; usado para manter a largura estável entre ticks. */
  pad?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Número que reanima a cada troca de valor.
 *
 * A animação é puramente CSS: `key={value}` faz o React remontar o nó, o que
 * reinicia a keyframe. Nenhuma biblioteca de animação, nenhum estado, nenhum
 * timer — o custo por tick é uma única substituição de nó de texto.
 */
export function AnimatedNumber({ value, animation, pad, className, style }: AnimatedNumberProps) {
  const animationClass = ANIMATION_CLASS[animation];

  return (
    <span className={['cd-value inline-block', className].filter(Boolean).join(' ')} style={style}>
      {/*
        O valor vindo do servidor pode diferir em um segundo do primeiro cálculo
        no navegador; a diferença é inerente a um contador e some no tick
        seguinte.
      */}
      <span
        key={value}
        className={['inline-block', animationClass].filter(Boolean).join(' ')}
        suppressHydrationWarning
      >
        {pad ? padValue(value, pad) : value}
      </span>
    </span>
  );
}
