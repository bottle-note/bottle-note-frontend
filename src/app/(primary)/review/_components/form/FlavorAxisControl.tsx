'use client';

import React from 'react';
import { TASTING_MAX_VALUE } from '@/constants/tastingNote';

interface Props {
  label: string;
  labelKo: string;
  guide: string;
  value: number;
  onChange: (value: number) => void;
}

export default function FlavorAxisControl({
  label,
  labelKo,
  guide,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-14 font-bold text-mainDarkGray">{label}</span>
          <span className="text-12 text-mainGray">{labelKo}</span>
        </div>
        <span className="text-14 font-medium text-subCoral">
          {value}/{TASTING_MAX_VALUE}
        </span>
      </div>

      {/* 슬라이더 */}
      <input
        type="range"
        min={0}
        max={TASTING_MAX_VALUE}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer
          bg-bgGray
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-subCoral
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer"
        style={{
          background: `linear-gradient(to right, #E58257 ${(value / TASTING_MAX_VALUE) * 100}%, #E6E6DD ${(value / TASTING_MAX_VALUE) * 100}%)`,
        }}
      />

      {/* 가이드 텍스트 */}
      <p className="text-11 text-mainGray">{guide}</p>
    </div>
  );
}
