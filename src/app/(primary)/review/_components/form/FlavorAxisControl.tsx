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
        <span className="text-12 font-bold text-mainDarkGray">{label}</span>
        <span className="text-[10px] text-mainGray">{descriptor}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-mainGray/60 whitespace-nowrap shrink-0 w-[24px]">
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
            [&::-webkit-slider-thumb]:bg-subCoral
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E58257 ${(value / TASTING_MAX_VALUE) * 100}%, #E6E6DD ${(value / TASTING_MAX_VALUE) * 100}%)`,
          }}
        />
        <span className="text-[9px] text-mainGray/60 whitespace-nowrap shrink-0">
          {maxHint}
        </span>
        <span className="text-12 font-bold text-subCoral w-3 text-right shrink-0">
          {value}
        </span>
      </div>
    </div>
  );
}
