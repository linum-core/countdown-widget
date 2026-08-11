'use client';

import { useId } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  /** Recebe o `id` já gerado, para amarrar `<label>` e controle. */
  children: (id: string) => React.ReactNode;
}

/** Rótulo + controle + dica, com `htmlFor` garantido. */
export function Field({ label, hint, children }: FieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink-soft text-xs font-medium tracking-wide uppercase">
        {label}
      </label>
      {children(id)}
      {hint ? <p className="text-ink-faint text-xs">{hint}</p> : null}
    </div>
  );
}
