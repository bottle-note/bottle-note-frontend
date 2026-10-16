import { TASTING_AXES } from '@/constants/tastingNote';

const graphLabels = TASTING_AXES.map((axis) => axis.labelKo);

export default function RadarPreview({ values }: { values: number[] }) {
  const point = (index: number, value: number) => {
    const angle = ((-90 + index * 60) * Math.PI) / 180;
    const radius = value * 15;
    return `${125 + Math.cos(angle) * radius},${125 + Math.sin(angle) * radius}`;
  };
  return (
    <svg
      className="h-250 w-250 overflow-visible"
      viewBox="0 0 250 250"
      role="img"
      aria-label="풍미 그래프 미리보기"
    >
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon
          key={ring}
          className="fill-none stroke-stroke-neutral-subtle [stroke-width:1]"
          points={values.map((_, index) => point(index, ring)).join(' ')}
        />
      ))}
      {graphLabels.map((label, index) => (
        <line
          key={label}
          className="stroke-stroke-neutral-subtle [stroke-width:1]"
          x1="125"
          y1="125"
          x2={point(index, 5).split(',')[0]}
          y2={point(index, 5).split(',')[1]}
        />
      ))}
      <polygon
        className="fill-bg-brand-weak stroke-fg-brand [stroke-width:2]"
        points={values.map((value, index) => point(index, value)).join(' ')}
      />
      {graphLabels.map((label, index) => {
        const [x, y] = point(index, 6).split(',').map(Number);
        return (
          <text
            key={label}
            className="fill-fg-neutral-muted text-11"
            x={x}
            y={y + 4}
            textAnchor={x < 110 ? 'end' : x > 140 ? 'start' : 'middle'}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
