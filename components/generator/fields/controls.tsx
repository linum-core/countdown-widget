'use client';

import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

/**
 * Controles de formulário do gerador.
 *
 * Ficam juntos porque compartilham exatamente o mesmo tratamento visual — um
 * arquivo por input criaria seis módulos de três linhas cada.
 */

const CONTROL_CLASS =
  'w-full rounded-lg border border-rule bg-white/70 px-3 py-2 text-sm text-ink ' +
  'transition-colors placeholder:text-ink-faint focus:border-ink/40 focus:outline-2 ' +
  'focus:outline-offset-1 focus:outline-accent';

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[CONTROL_CLASS, className].filter(Boolean).join(' ')} {...props} />;
}

interface SelectProps<T extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value'
> {
  value: T;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  onValueChange: (value: T) => void;
}

export function Select<T extends string>({
  value,
  options,
  labels,
  onValueChange,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(event) => onValueChange(event.target.value as T)}
      className={[CONTROL_CLASS, 'appearance-none pr-8', className].filter(Boolean).join(' ')}
      {...props}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels?.[option] ?? option}
        </option>
      ))}
    </select>
  );
}

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

/** Caixa de seleção compacta usada nos flags de unidade e nos extras. */
export function Toggle({ checked, onCheckedChange, label }: ToggleProps) {
  return (
    <label className="text-ink-soft flex cursor-pointer items-center gap-2 text-sm select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="accent-accent size-4"
      />
      {label}
    </label>
  );
}

interface ColorInputProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
}

/** Seletor de cor nativo somado a um campo hex editável à mão. */
export function ColorInput({ id, value, onValueChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="border-rule size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1"
        aria-label="Seletor de cor"
      />
      <TextInput
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        spellCheck={false}
        className="font-mono"
      />
    </div>
  );
}
