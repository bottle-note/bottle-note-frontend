import type { ReviewTastingProfile } from '@/api/review/types';

type Props = {
  profile: ReviewTastingProfile | null | undefined;
  size?: number;
};

const CHART_SIZE = 340;
const CENTER = CHART_SIZE / 2;
const RADIUS = 104;
const LABEL_RADIUS = 130;
const LABEL_FONT_SIZE = 15;
const SIDE_LABEL_INSET = 14;
const BADGE_RADIUS = 12;
const DEFAULT_MAX_SCORE = 5;

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

/** 좌우 항목은 바깥쪽으로 이어 쓰고, 넘치는 긴 이름은 남은 폭에 맞춰 줄인다. */
function labelLayout(index: number, count: number, name: string) {
  const axisPoint = point(index, count, LABEL_RADIUS);
  const dx = axisPoint.x - CENTER;
  const anchor =
    Math.abs(dx) < 8
      ? ('middle' as const)
      : dx > 0
        ? ('start' as const)
        : ('end' as const);
  // 좌우 이름은 글자 폭만큼 바깥으로 이어지므로 차트 쪽으로 당겨 둔다.
  const x =
    anchor === 'start'
      ? axisPoint.x - SIDE_LABEL_INSET
      : anchor === 'end'
        ? axisPoint.x + SIDE_LABEL_INSET
        : axisPoint.x;
  const available =
    anchor === 'middle' ? CHART_SIZE : anchor === 'start' ? CHART_SIZE - x : x;
  const estimated = name.length * LABEL_FONT_SIZE;
  return {
    x,
    y: axisPoint.y,
    anchor,
    textLength: estimated > available ? available : undefined,
  };
}

/** 낮은 점수끼리 중심에서 겹치지 않도록, 이웃 배지가 닿지 않는 반경 아래로는 배지를 두지 않는다. */
const getBadgeMinRadius = (count: number) =>
  (BADGE_RADIUS + 1) / Math.sin(Math.PI / count);

const getGridLevels = (maxScore: number) =>
  maxScore <= DEFAULT_MAX_SCORE ? Math.max(1, Math.round(maxScore)) : 5;

/** 그래프로 그릴 수 있는 저장 프로필인지 확인한다. 척도나 점수가 어긋난 데이터는 그리지 않는다. */
export function isDisplayableTastingProfile(
  profile: ReviewTastingProfile | null | undefined,
): profile is ReviewTastingProfile {
  return (
    !!profile &&
    Number.isFinite(profile.maxScore) &&
    profile.maxScore > 0 &&
    Array.isArray(profile.axes) &&
    profile.axes.length > 0 &&
    profile.axes.every(
      (axis) =>
        !!axis.name?.trim() &&
        Number.isFinite(axis.score) &&
        axis.score >= 0 &&
        axis.score <= profile.maxScore,
    )
  );
}

/** API에 저장된 축의 순서·이름·척도를 그대로 사용하는 조회 전용 그래프. */
export default function ReviewTastingProfileChart({
  profile,
  size = 240,
}: Props) {
  if (!isDisplayableTastingProfile(profile)) return null;

  const { axes, maxScore } = profile;
  const accessibleName = `테이스팅 프로필: ${axes
    .map(
      (axis) =>
        `${axis.name} ${axis.score}/${maxScore}${axis.description ? `, ${axis.description}` : ''}`,
    )
    .join('; ')}`;
  const levels = getGridLevels(maxScore);
  const badgeMinRadius = getBadgeMinRadius(axes.length);
  const scaleLabel =
    maxScore !== DEFAULT_MAX_SCORE ? `${maxScore}점 만점` : null;

  if (axes.length < 3) {
    return (
      <figure>
        <div
          role="img"
          aria-label={accessibleName}
          className="flex flex-wrap items-baseline gap-x-16 gap-y-4 text-14 text-fg-neutral"
        >
          {axes.map((axis, index) => (
            <p key={`${axis.code ?? axis.name}-${index}`}>
              {axis.name}{' '}
              <span className="font-bold text-fg-brand">{axis.score}</span>
            </p>
          ))}
          {scaleLabel && (
            <span className="text-12 text-fg-neutral-muted">{scaleLabel}</span>
          )}
        </div>
      </figure>
    );
  }

  return (
    <figure>
      <svg
        role="img"
        aria-label={accessibleName}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        width={size}
        height={size}
        className="mx-auto block h-auto max-w-full text-fg-neutral"
      >
        {Array.from({ length: levels }, (_, i) => i + 1).map((level) => (
          <polygon
            key={level}
            points={polygon(axes.length, (RADIUS * level) / levels)}
            fill="none"
            stroke="var(--color-stroke-neutral-subtle)"
            strokeWidth={level === levels ? 1.5 : 0.8}
          />
        ))}
        {axes.map((axis, index) => {
          const end = point(index, axes.length, RADIUS);
          const label = labelLayout(index, axes.length, axis.name);
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
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                dominantBaseline="central"
                textLength={label.textLength}
                lengthAdjust="spacingAndGlyphs"
                fill="currentColor"
                fontSize={LABEL_FONT_SIZE}
                fontWeight="700"
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
          strokeLinejoin="round"
        />
        {axes.map((axis, index) => {
          const isZero = axis.score === 0;
          const { x, y } = point(
            index,
            axes.length,
            Math.max(badgeMinRadius, (RADIUS * axis.score) / maxScore),
          );
          return (
            <g
              key={`${axis.code ?? axis.name}-${index}`}
              data-testid="tasting-score-badge"
            >
              <circle
                cx={x}
                cy={y}
                r={BADGE_RADIUS}
                fill={
                  isZero
                    ? 'var(--color-bg-layer-default)'
                    : 'var(--color-bg-brand-solid)'
                }
                stroke={
                  isZero
                    ? 'var(--color-stroke-neutral-basement)'
                    : 'var(--color-bg-layer-default)'
                }
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={
                  isZero
                    ? 'var(--color-fg-neutral-muted)'
                    : 'var(--color-fg-brand-contrast)'
                }
                fontSize="13"
                fontWeight="800"
              >
                {axis.score}
              </text>
            </g>
          );
        })}
      </svg>
      {scaleLabel && (
        <figcaption className="mt-2 text-center text-12 text-fg-neutral-muted">
          {scaleLabel}
        </figcaption>
      )}
    </figure>
  );
}
