'use client';

import TastingSlider from './TastingSlider';
import { TastingNoteData, TASTING_AXES, TastingAxisKey } from '../types';

interface Props {
  data: TastingNoteData;
  onChange: (key: TastingAxisKey, value: number) => void;
}

export default function TastingSliderGroup({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      {TASTING_AXES.map((axis) => (
        <TastingSlider
          key={axis.key}
          label={axis.label}
          labelEng={axis.labelEng}
          value={data[axis.key]}
          onChange={(value) => onChange(axis.key, value)}
        />
      ))}
    </div>
  );
}
