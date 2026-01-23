'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { TastingNoteData, TASTING_AXES } from '../types';

interface Props {
  data: TastingNoteData;
}

export default function TastingRadarChart({ data }: Props) {
  const chartData = TASTING_AXES.map((axis) => ({
    axis: axis.label,
    value: data[axis.key],
    fullMark: 10,
  }));

  return (
    <div className="w-full aspect-square max-w-[300px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#525252', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#a3a3a3', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="테이스팅"
            dataKey="value"
            stroke="#FF6B35"
            fill="#FF6B35"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
