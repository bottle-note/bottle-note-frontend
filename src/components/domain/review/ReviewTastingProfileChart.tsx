import type { ReviewTastingProfile } from '@/api/review/types';

type Props = {
  profile: ReviewTastingProfile | null | undefined;
  size?: number;
  showDescriptions?: boolean;
};

const CHART_SIZE = 320;
const CENTER = CHART_SIZE / 2;
const RADIUS = 94;
const LABEL_RADIUS = 126;

function point(index: number, count: number, radius: number) {
  const angle = (2 * Math.PI * index) / count - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function polygon(count: number, radius: number) {
  return Array.from({ length: count }, (_, index) => {
    const { x, y } = point(index, count, radius);
    return `${x},${y}`;
  }).join(' ');
}

/** API에 저장된 축의 순서·이름·척도를 그대로 사용하는 조회 전용 그래프. */
export default function ReviewTastingProfileChart({
  profile,
  size = 240,
  showDescriptions = false,
}: Props) {
  if (
    !profile ||
    !Number.isFinite(profile.maxScore) ||
    profile.maxScore <= 0 ||
    !Array.isArray(profile.axes) ||
    profile.axes.length === 0 ||
    profile.axes.some(
      (axis) =>
        !axis.name?.trim() ||
        !Number.isFinite(axis.score) ||
        axis.score < 0 ||
        axis.score > profile.maxScore,
    )
  ) {
    return null;
  }

  const { axes, maxScore } = profile;
  const accessibleName = `테이스팅 프로필: ${axes
    .map(
      (axis) =>
        `${axis.name} ${axis.score}/${maxScore}${axis.description ? `, ${axis.description}` : ''}`,
    )
    .join('; ')}`;
  const highlights = [...axes]
    .filter((axis) => axis.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <figure className="border-t border-stroke-neutral-subtle pt-16">
      <figcaption className="text-13 font-semibold text-fg-neutral">
        테이스팅 프로필
      </figcaption>
      {axes.length < 3 ? (
        <div role="img" aria-label={accessibleName} className="mt-12 text-13">
          {axes.map((axis, index) => (
            <p key={`${axis.code ?? axis.name}-${index}`}>
              {axis.name} {axis.score}/{maxScore}
            </p>
          ))}
        </div>
      ) : (
        <svg
          role="img"
          aria-label={accessibleName}
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          width={size}
          height={size}
          className="mx-auto mt-8 max-w-full text-fg-neutral"
        >
          {[1, 2, 3, 4, 5].map((level) => (
            <polygon
              key={level}
              points={polygon(axes.length, (RADIUS * level) / 5)}
              fill="none"
              stroke="var(--color-stroke-neutral-subtle)"
              strokeWidth={level === 5 ? 1.5 : 0.8}
            />
          ))}
          {axes.map((axis, index) => {
            const end = point(index, axes.length, RADIUS);
            const label = point(index, axes.length, LABEL_RADIUS);
            return (
              <g key={`${axis.code ?? axis.name}-${index}`}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={end.x}
                  y2={end.y}
                  stroke="var(--color-stroke-neutral-subtle)"
                  strokeWidth="0.8"
                />
                <text
                  data-testid="tasting-axis-label"
                  x={Math.max(55, Math.min(CHART_SIZE - 55, label.x))}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
                  fontSize="16"
                >
                  {axis.name}
                </text>
              </g>
            );
          })}
          <polygon
            data-testid="tasting-value-polygon"
            points={axes
              .map((axis, index) => {
                const { x, y } = point(
                  index,
                  axes.length,
                  (RADIUS * axis.score) / maxScore,
                );
                return `${x},${y}`;
              })
              .join(' ')}
            fill="var(--color-bg-brand-weak)"
            stroke="var(--color-stroke-brand-solid)"
            strokeWidth="2"
          />
          {axes.map((axis, index) => {
            const { x, y } = point(
              index,
              axes.length,
              (RADIUS * axis.score) / maxScore,
            );
            return (
              <circle
                key={`${axis.code ?? axis.name}-${index}`}
                cx={x}
                cy={y}
                r="3.5"
                fill="var(--color-bg-brand-solid)"
              />
            );
          })}
        </svg>
      )}
      {showDescriptions ? (
        <ul className="mt-8 space-y-4 text-13 text-fg-neutral-muted">
          {axes.map((axis, index) => (
            <li key={`${axis.code ?? axis.name}-${index}`}>
              <span className="font-medium text-fg-neutral">
                {axis.name} {axis.score}/{maxScore}
              </span>
              {axis.description && ` · ${axis.description}`}
            </li>
          ))}
        </ul>
      ) : highlights.length > 0 ? (
        <p className="mt-4 text-center text-12 text-fg-neutral-muted">
          {highlights
            .map((axis) => `${axis.name} ${axis.score}/${maxScore}`)
            .join(' · ')}
        </p>
      ) : null}
    </figure>
  );
}
