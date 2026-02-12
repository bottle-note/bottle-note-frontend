'use client';

import { useRef, useEffect } from 'react';

interface Props {
  label: string;
  labelEng: string;
  value: number;
  onChange: (value: number) => void;
}

export default function TastingSlider({
  label,
  labelEng,
  value,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const preventScroll = (e: TouchEvent) => {
      e.stopPropagation();
    };

    input.addEventListener('touchstart', preventScroll, { passive: true });
    input.addEventListener('touchmove', preventScroll, { passive: true });

    return () => {
      input.removeEventListener('touchstart', preventScroll);
      input.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0">
        <p className="text-14 font-medium text-mainDarkGray">{label}</p>
        <p className="text-10 text-subCoral">{labelEng}</p>
      </div>
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        tabIndex={-1}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-subCoral touch-pan-x"
      />
      <span className="w-8 text-right text-14 font-bold text-subCoral">
        {value}
      </span>
    </div>
  );
}
