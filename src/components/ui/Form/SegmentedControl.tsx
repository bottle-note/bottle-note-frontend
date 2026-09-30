'use client';

import { useId } from 'react';

interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** A single-choice group with native arrow-key navigation and form semantics. */
export default function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: Props<T>) {
  const name = useId();
  return (
    <fieldset
      disabled={disabled}
      className="flex min-w-0 gap-4 rounded-lg bg-bg-neutral-weak p-4"
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="relative flex min-w-0 flex-1 cursor-pointer"
        >
          <input
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="flex min-h-40 w-full items-center justify-center rounded-md border border-transparent px-8 py-8 text-center text-15 text-fg-neutral-muted transition-colors peer-checked:border-stroke-brand-solid peer-checked:bg-bg-layer-default peer-checked:font-bold peer-checked:text-fg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-stroke-focus-ring peer-disabled:cursor-not-allowed peer-disabled:text-fg-disabled">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
