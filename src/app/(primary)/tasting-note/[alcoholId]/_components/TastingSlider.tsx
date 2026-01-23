'use client';

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
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0">
        <p className="text-14 font-medium text-mainDarkGray">{label}</p>
        <p className="text-10 text-subCoral">{labelEng}</p>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-subCoral"
      />
      <span className="w-8 text-right text-14 font-bold text-subCoral">
        {value}
      </span>
    </div>
  );
}
