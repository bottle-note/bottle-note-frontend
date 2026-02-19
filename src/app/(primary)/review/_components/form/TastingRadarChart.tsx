'use client';

import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  TASTING_AXES,
  TASTING_MAX_VALUE,
  LEVEL_DESCRIPTIONS,
  type TastingNoteValues,
  type TastingAxisKey,
} from '@/constants/tastingNote';

interface Props {
  values: TastingNoteValues;
  size?: number;
  activeAxis?: string | null;
  /** 차트 탭으로 값 변경 */
  onAxisChange?: (key: TastingAxisKey, value: number) => void;
}

const AXIS_COUNT = TASTING_AXES.length;
const ANGLE_OFFSET = -Math.PI / 2;
const MIN_DISPLAY_RATIO = 0.25;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  index: number,
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / AXIS_COUNT + ANGLE_OFFSET;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  count: number,
): string {
  return Array.from({ length: count })
    .map((_, i) => {
      const { x, y } = polarToCartesian(cx, cy, radius, i);
      return `${x},${y}`;
    })
    .join(' ');
}

function pointerToAxisValue(
  pointerX: number,
  pointerY: number,
  cx: number,
  cy: number,
  maxRadius: number,
): number {
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ratio = Math.max(0, Math.min(1, dist / maxRadius));
  return Math.round(ratio * TASTING_MAX_VALUE);
}

function findClosestAxis(
  pointerX: number,
  pointerY: number,
  cx: number,
  cy: number,
): number {
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  const pointerAngle = Math.atan2(dy, dx);

  let closestIndex = 0;
  let minDiff = Infinity;

  for (let i = 0; i < AXIS_COUNT; i++) {
    const axisAngle = (2 * Math.PI * i) / AXIS_COUNT + ANGLE_OFFSET;
    let diff = Math.abs(pointerAngle - axisAngle);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/** 각 꼭짓점의 값 배지 */
function ValueBadge({
  targetX,
  targetY,
  value,
  isActive,
}: {
  targetX: number;
  targetY: number;
  value: number;
  isActive: boolean;
}) {
  const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };
  const cx = useSpring(useMotionValue(targetX), springConfig);
  const cy = useSpring(useMotionValue(targetY), springConfig);

  useEffect(() => {
    cx.set(targetX);
    cy.set(targetY);
  }, [targetX, targetY, cx, cy]);

  const r = isActive ? 12 : 10;
  const hasValue = value > 0;

  return (
    <>
      <motion.circle cx={cx} cy={cy} r={r + 3} fill="rgba(229,130,87,0.15)" />
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={hasValue ? '#E58257' : '#CDCDC5'}
        stroke="#fff"
        strokeWidth={2.5}
      />
      <motion.text
        x={cx}
        y={cy}
        dy={0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={isActive ? 12 : 10}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {value}
      </motion.text>
    </>
  );
}

export default function TastingRadarChart({
  values,
  size = 260,
  activeAxis = null,
  onAxisChange,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 30;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tapFeedback, setTapFeedback] = useState<{
    level: number;
  } | null>(null);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);

  const isInteractive = !!onAxisChange;

  const valuePoints = useMemo(
    () =>
      TASTING_AXES.map((axis, i) => {
        const ratio = values[axis.key] / TASTING_MAX_VALUE;
        return polarToCartesian(cx, cy, maxRadius * ratio, i);
      }),
    [values, cx, cy, maxRadius],
  );

  const badgePoints = useMemo(
    () =>
      TASTING_AXES.map((axis, i) => {
        const ratio = values[axis.key] / TASTING_MAX_VALUE;
        const displayRatio = Math.max(MIN_DISPLAY_RATIO, ratio);
        return polarToCartesian(cx, cy, maxRadius * displayRatio, i);
      }),
    [values, cx, cy, maxRadius],
  );

  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLevels = Array.from({ length: TASTING_MAX_VALUE }, (_, i) => i + 1);

  const toSvgCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = size / rect.width;
      const scaleY = size / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [size],
  );

  const handleChartTap = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteractive) return;
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      const closestIdx = findClosestAxis(x, y, cx, cy);
      const newValue = pointerToAxisValue(x, y, cx, cy, maxRadius);
      const axisKey = TASTING_AXES[closestIdx].key;
      onAxisChange(axisKey, newValue);

      // Layer 3: 탭 레벨 설명 피드백
      setTapFeedback({ level: newValue });
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setTapFeedback(null), 800);
    },
    [isInteractive, toSvgCoords, cx, cy, maxRadius, onAxisChange],
  );

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
    >
      {/* 배경 격자 */}
      {gridLevels.map((level) => {
        const radius = (maxRadius * level) / TASTING_MAX_VALUE;
        return (
          <polygon
            key={level}
            points={buildPolygonPoints(cx, cy, radius, AXIS_COUNT)}
            fill="none"
            stroke="#E6E6DD"
            strokeWidth={level === TASTING_MAX_VALUE ? 1.5 : 0.8}
            opacity={level === TASTING_MAX_VALUE ? 0.8 : 0.5}
          />
        );
      })}

      {/* 각 축의 격자 레벨 숫자 */}
      {TASTING_AXES.map((_, axisIdx) => {
        const angle = (2 * Math.PI * axisIdx) / AXIS_COUNT + ANGLE_OFFSET;
        const perpAngle = angle + Math.PI / 2;
        const offsetDist = 7;

        return gridLevels.map((level) => {
          const radius = (maxRadius * level) / TASTING_MAX_VALUE;
          const px = cx + radius * Math.cos(angle);
          const py = cy + radius * Math.sin(angle);

          return (
            <text
              key={`grid-${axisIdx}-${level}`}
              x={px + offsetDist * Math.cos(perpAngle)}
              y={py + offsetDist * Math.sin(perpAngle)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#C4C4BB"
              fontSize={7}
              fontWeight={400}
              style={{ pointerEvents: 'none' }}
            >
              {level}
            </text>
          );
        });
      })}

      {/* 축 선 */}
      {TASTING_AXES.map((axis, i) => {
        const { x, y } = polarToCartesian(cx, cy, maxRadius, i);
        return (
          <line
            key={`axis-${axis.key}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E6E6DD"
            strokeWidth={0.8}
            opacity={0.6}
          />
        );
      })}

      {/* 값 영역 */}
      <motion.polygon
        animate={{ points: valuePolygon }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        fill="#EF9A6E"
        fillOpacity={0.25}
        stroke="#E58257"
        strokeWidth={2}
      />

      {/* 탭 히트 영역 */}
      {isInteractive && (
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius + 10}
          fill="transparent"
          cursor="pointer"
          onPointerUp={handleChartTap}
        />
      )}

      {/* 값 배지 */}
      {badgePoints.map((p, i) => (
        <ValueBadge
          key={TASTING_AXES[i].key}
          targetX={p.x}
          targetY={p.y}
          value={values[TASTING_AXES[i].key]}
          isActive={activeAxis === TASTING_AXES[i].key}
        />
      ))}

      {/* 축 라벨 (한글) */}
      {TASTING_AXES.map((axis, i) => {
        const { x, y } = polarToCartesian(cx, cy, maxRadius + 20, i);
        return (
          <text
            key={axis.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-mainDarkGray"
            fontSize={11}
            fontWeight={activeAxis === axis.key ? 700 : 600}
          >
            {axis.labelKo}
          </text>
        );
      })}

      {/* Layer 3: 탭 레벨 설명 (차트 중앙에 잠깐 표시) */}
      <AnimatePresence>
        {tapFeedback && (
          <motion.text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#E58257"
            fontSize={13}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            {LEVEL_DESCRIPTIONS[tapFeedback.level]}
          </motion.text>
        )}
      </AnimatePresence>
    </svg>
  );
}
