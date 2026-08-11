interface ProgressBarProps {
  /** Fração decorrida, em [0, 1]. */
  value: number;
  label: string;
}

/** Barra de progresso entre a origem e o alvo. */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const percent = Math.round(value * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className="cd-progress w-full overflow-hidden rounded-full"
      style={{ height: '0.35rem' }}
      // A fração vem do relógio, que difere entre o render do servidor e o do navegador.
      suppressHydrationWarning
    >
      <div
        className="cd-progress-fill h-full rounded-full"
        style={{
          width: `${percent}%`,
          transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        suppressHydrationWarning
      />
    </div>
  );
}
