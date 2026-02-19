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

/**
 * 터치/마우스 좌표 → 해당 축의 0~5 값으로 변환
 * 중심에서의 거리를 사용
 */
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

/**
 * 포인터 위치에서 가장 가까운 축 인덱스를 반환
 */
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

/** 개별 꼭짓점: spring 애니메이션 (사이즈 고정) */
function AnimatedVertex({
  targetX,
  targetY,
}: {
  targetX: number;
  targetY: number;
}) {
  const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };
  const x = useSpring(useMotionValue(targetX), springConfig);
  const y = useSpring(useMotionValue(targetY), springConfig);

  useEffect(() => {
    x.set(targetX);
    y.set(targetY);
  }, [targetX, targetY, x, y]);

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={4}
      fill="#E58257"
      stroke="#fff"
      strokeWidth={1.5}
    />
  );
}

/** 탭 피드백 툴팁 */
function TapTooltip({
  x,
  y,
  value,
  axisIndex,
  cx,
  cy,
}: {
  x: number;
  y: number;
  value: number;
  axisIndex: number;
  cx: number;
  cy: number;
}) {
  const angle = (2 * Math.PI * axisIndex) / AXIS_COUNT + ANGLE_OFFSET;
  const offsetX = Math.cos(angle) * 16;
  const offsetY = Math.sin(angle) * 16;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const dir = dist < 30 ? 1 : -0.5;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.15 }}
    >
      <rect
        x={x + offsetX * dir - 12}
        y={y + offsetY * dir - 10}
        width={24}
        height={20}
        rx={4}
        fill="#E58257"
      />
      <text
        x={x + offsetX * dir}
        y={y + offsetY * dir + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={11}
        fontWeight={700}
      >
        {value}
      </text>
    </motion.g>
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
  const [tappedAxis, setTappedAxis] = useState<number | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  const isInteractive = !!onAxisChange;

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

  /** SVG 좌표계로 변환 */
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

  /** 차트 탭: 가장 가까운 축을 찾아서 값 즉시 반영 */
  const handleChartTap = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteractive) return;

      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      const closestIdx = findClosestAxis(x, y, cx, cy);
      const newValue = pointerToAxisValue(x, y, cx, cy, maxRadius);
      const axisKey = TASTING_AXES[closestIdx].key;

      onAxisChange(axisKey, newValue);

      // 툴팁 표시 후 자동 숨김
      setTappedAxis(closestIdx);
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => setTappedAxis(null), 800);
    },
    [isInteractive, toSvgCoords, cx, cy, maxRadius, onAxisChange],
  );

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, []);

  const currentActiveAxis =
    tappedAxis !== null ? TASTING_AXES[tappedAxis].key : activeAxis;

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

      {/* 꼭짓점 (애니메이션) */}
      {valuePoints.map((p, i) => (
        <AnimatedVertex key={TASTING_AXES[i].key} targetX={p.x} targetY={p.y} />
      ))}

      {/* 탭 히트 영역 (차트 전체) */}
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

      {/* 탭 피드백 툴팁 */}
      <AnimatePresence>
        {tappedAxis !== null && (
          <TapTooltip
            x={valuePoints[tappedAxis].x}
            y={valuePoints[tappedAxis].y}
            value={values[TASTING_AXES[tappedAxis].key]}
            axisIndex={tappedAxis}
            cx={cx}
            cy={cy}
          />
        )}
      </AnimatePresence>

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
            fontWeight={currentActiveAxis === axis.key ? 700 : 500}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
