import type { ButtonHTMLAttributes } from 'react';

type Variant = 'solid' | 'outline' | 'ghost';

const VARIANT_CLASS: Record<Variant, string> = {
  solid: 'bg-ink text-paper hover:bg-ink/90',
  outline: 'border border-rule bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]',
  ghost: 'bg-transparent text-ink-soft hover:text-ink',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'solid', className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        'focus-visible:outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
