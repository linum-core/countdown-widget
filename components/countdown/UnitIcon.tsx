import type { UnitKey } from '@/types/widget';

/**
 * Ícones desenhados à mão em SVG inline.
 *
 * Uma biblioteca de ícones acrescentaria dezenas de kilobytes ao bundle para
 * cinco glifos — o oposto do orçamento de performance deste widget.
 */
const PATHS: Record<UnitKey, React.ReactNode> = {
  /* Mesma folhinha do dia, com a grade do mês inteiro em vez de um só vinco. */
  months: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4M8 13h2M14 13h2M8 16.5h2M14 16.5h2" />
    </>
  ),
  days: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  hours: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2" />
    </>
  ),
  minutes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4.5 1.6" />
    </>
  ),
  seconds: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M9.5 2.5h5M12 9.8v3.7" />
    </>
  ),
};

interface UnitIconProps {
  unit: UnitKey;
  className?: string;
}

export function UnitIcon({ unit, className }: UnitIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[unit]}
    </svg>
  );
}
