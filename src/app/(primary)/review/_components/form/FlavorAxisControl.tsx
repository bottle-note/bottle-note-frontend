'use client';

import React from 'react';
import { TASTING_MAX_VALUE } from '@/constants/tastingNote';

interface Props {
  label: string;
  descriptor: string;
  value: number;
  minHint: string;
  maxHint: string;
  onChange: (value: number) => void;
}

export default function FlavorAxisControl({
  label,
  descriptor,
  value,
  minHint,
  maxHint,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span className="text-12 font-bold text-fg-neutral">{label}</span>
        <span className="text-[10px] text-fg-neutral-muted">{descriptor}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-[24px] shrink-0 whitespace-nowrap text-[9px] text-fg-neutral-subtle">
          {minHint}
        </span>
        <input
          type="range"
          min={0}
          max={TASTING_MAX_VALUE}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-bg-brand-solid
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-bg-brand-solid) ${(value / TASTING_MAX_VALUE) * 100}%, var(--color-stroke-neutral-subtle) ${(value / TASTING_MAX_VALUE) * 100}%)`,
          }}
        />
        <span className="shrink-0 whitespace-nowrap text-[9px] text-fg-neutral-subtle">
          {maxHint}
        </span>
        <span className="w-3 shrink-0 text-right text-12 font-bold text-fg-brand">
          {value}
        </span>
      </div>
    </div>
  );
}
