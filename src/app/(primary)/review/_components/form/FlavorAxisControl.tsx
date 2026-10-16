'use client';

import React from 'react';
import { TASTING_MAX_VALUE } from '@/constants/tastingNote';

interface Props {
  label: string;
  descriptor?: string | null;
  value: number;
  max: number;
  minHint: string;
  maxHint: string;
  /** 편집을 시작할 때의 점수. 값이 달라지면 표시한다. */
  originalValue?: number;
  isHighlighted?: boolean;
  onChange: (value: number) => void;
}

export default function FlavorAxisControl({
  label,
  descriptor,
  value,
  max,
  minHint,
  maxHint,
  originalValue,
  isHighlighted = false,
  onChange,
}: Props) {
  const percent = (value / max) * 100;
  const isChanged = originalValue !== undefined && originalValue !== value;

  return (
    <div
      className={`flex flex-col gap-4 ${
        isHighlighted ? '-mx-20 bg-bg-brand-weak px-20 py-8' : ''
      }`}
    >
      <div className="flex items-baseline gap-6">
        <span className="text-12 font-bold text-fg-neutral">{label}</span>
        {descriptor && (
          <span className="text-[10px] text-fg-neutral-muted">
            {descriptor}
          </span>
        )}
        {isChanged && (
          <span className="ml-auto rounded-sm bg-bg-brand-weak px-6 text-[10px] font-medium text-fg-brand">
            원래 {originalValue}
          </span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <span className="w-24 shrink-0 whitespace-nowrap text-[9px] text-fg-neutral-subtle">
          {minHint}
        </span>
        <div className="relative flex flex-1 items-center">
          <input
            type="range"
            aria-label={label}
            min={0}
            max={max}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-4 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-16
              [&::-webkit-slider-thumb]:h-16
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-bg-brand-solid
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-bg-brand-solid) ${percent}%, var(--color-stroke-neutral-subtle) ${percent}%)`,
            }}
          />
          {/* 5점보다 세밀한 척도는 눈금으로 위치를 보조한다 */}
          {max > TASTING_MAX_VALUE &&
            Array.from({ length: max + 1 }, (_, tick) => (
              <span
                key={tick}
                aria-hidden
                className="pointer-events-none absolute top-full mt-2 h-4 w-1 bg-stroke-neutral-subtle"
                style={{ left: `${(tick / max) * 100}%` }}
              />
            ))}
        </div>
        <span className="shrink-0 whitespace-nowrap text-[9px] text-fg-neutral-subtle">
          {maxHint}
        </span>
        <span
          className={`${max === TASTING_MAX_VALUE ? 'w-12' : 'w-28'} shrink-0 text-right text-12 font-bold text-fg-brand`}
        >
          {value}
          {max !== TASTING_MAX_VALUE && (
            <span className="text-[10px] font-medium text-fg-neutral-subtle">
              /{max}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
