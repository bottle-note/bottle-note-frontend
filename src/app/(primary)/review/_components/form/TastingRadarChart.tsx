'use client';

import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  TASTING_AXES,
  TASTING_MAX_VALUE,
  type TastingNoteValues,
} from '@/constants/tastingNote';

interface Props {
  values: TastingNoteValues;
  size?: number;
  /** 변경된 축의 key (슬라이더 조작 시 해당 점에 pulse 효과) */
  activeAxis?: string | null;
}

const AXIS_COUNT = TASTING_AXES.length;
const ANGLE_OFFSET = -Math.PI / 2;

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

/** 개별 꼭짓점: spring 애니메이션으로 위치 이동 */
function AnimatedVertex({
  targetX,
  targetY,
  isActive,
}: {
  targetX: number;
  targetY: number;
  isActive: boolean;
}) {
  const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };
  const x = useSpring(useMotionValue(targetX), springConfig);
  const y = useSpring(useMotionValue(targetY), springConfig);

  useEffect(() => {
    x.set(targetX);
    y.set(targetY);
  }, [targetX, targetY, x, y]);

  const scale = useTransform(x, () => (isActive ? 1.4 : 1));

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={4}
      fill="#E58257"
      stroke="#fff"
      strokeWidth={1.5}
      style={{ scale }}
      transition={{ scale: { duration: 0.2 } }}
    />
  );
}

export default function TastingRadarChart({
  values,
  size = 260,
  activeAxis = null,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 30;

  const valuePoints = useMemo(
    () =>
      TASTING_AXES.map((axis, i) => {
        const ratio = values[axis.key] / TASTING_MAX_VALUE;
        return polarToCartesian(cx, cy, maxRadius * ratio, i);
      }),
    [values, cx, cy, maxRadius],
  );

  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLevels = Array.from({ length: TASTING_MAX_VALUE }, (_, i) => i + 1);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
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

      {/* 값 영역 (부드러운 트랜지션) */}
      <motion.polygon
        animate={{ points: valuePolygon }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        fill="#EF9A6E"
        fillOpacity={0.25}
        stroke="#E58257"
        strokeWidth={2}
      />

      {/* 값 꼭짓점 (spring 애니메이션 + active pulse) */}
      {valuePoints.map((p, i) => (
        <AnimatedVertex
          key={TASTING_AXES[i].key}
          targetX={p.x}
          targetY={p.y}
          isActive={activeAxis === TASTING_AXES[i].key}
        />
      ))}

      {/* 축 라벨 */}
      {TASTING_AXES.map((axis, i) => {
        const { x, y } = polarToCartesian(cx, cy, maxRadius + 18, i);
        return (
          <text
            key={axis.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-mainDarkGray"
            fontSize={11}
            fontWeight={500}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
