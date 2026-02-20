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
  /** 배지 드래그로 값 변경 */
  onAxisChange?: (key: TastingAxisKey, value: number) => void;
}

const AXIS_COUNT = TASTING_AXES.length;
const ANGLE_OFFSET = -Math.PI / 2;
const MIN_DISPLAY_RATIO = 0.25;
const BADGE_HIT_RADIUS = 18;

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

/** 포인터 위치에서 가장 가까운 축 인덱스 계산 (탭용) */
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

/** 중심으로부터의 거리를 0~MAX_VALUE 값으로 변환 (탭용) */
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

/** 포인터를 특정 축 방향으로 투영하여 0~MAX_VALUE 값 계산 (드래그용) */
function projectOntoAxis(
  pointerX: number,
  pointerY: number,
  cx: number,
  cy: number,
  axisIndex: number,
  maxRadius: number,
): number {
  const angle = (2 * Math.PI * axisIndex) / AXIS_COUNT + ANGLE_OFFSET;
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  const projection = dx * Math.cos(angle) + dy * Math.sin(angle);
  const ratio = Math.max(0, Math.min(1, projection / maxRadius));
  return Math.round(ratio * TASTING_MAX_VALUE);
}

/** 드래그 가능한 값 배지 — 스냅포인트 핸들 */
function ValueBadge({
  targetX,
  targetY,
  value,
  isActive,
  isDragging,
}: {
  targetX: number;
  targetY: number;
  value: number;
  isActive: boolean;
  isDragging: boolean;
}) {
  const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };
  const animX = useSpring(useMotionValue(targetX), springConfig);
  const animY = useSpring(useMotionValue(targetY), springConfig);

  useEffect(() => {
    animX.set(targetX);
    animY.set(targetY);
  }, [targetX, targetY, animX, animY]);

  const hasValue = value > 0;
  const r = isDragging ? 14 : isActive ? 12 : 11;
  const glowR = isDragging ? 19 : 16;
  const haloR = isDragging ? 24 : 20;

  return (
    <>
      {/* 외부 헤일로 — "잡을 수 있다"는 어포던스 */}
      <motion.circle
        cx={animX}
        cy={animY}
        r={haloR}
        fill={hasValue ? 'rgba(229,130,87,0.05)' : 'rgba(180,180,170,0.04)'}
        stroke={hasValue ? 'rgba(229,130,87,0.2)' : 'rgba(180,180,170,0.15)'}
        strokeWidth={isDragging ? 1.5 : 1}
        strokeDasharray={isDragging ? 'none' : '3 2'}
      />
      {/* 글로우 링 */}
      <motion.circle
        cx={animX}
        cy={animY}
        r={glowR}
        fill={hasValue ? 'rgba(229,130,87,0.1)' : 'rgba(180,180,170,0.06)'}
      />
      {/* 메인 원 */}
      <motion.circle
        cx={animX}
        cy={animY}
        r={r}
        fill={hasValue ? '#E58257' : '#CDCDC5'}
        stroke="#fff"
        strokeWidth={isDragging ? 3 : 2.5}
        filter={isDragging ? 'url(#badge-glow)' : 'url(#badge-shadow)'}
      />
      {/* 숫자 */}
      <motion.text
        x={animX}
        y={animY}
        dy={0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={isDragging ? 13 : isActive ? 12 : 10}
        fontWeight={700}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
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
  const ctrX = size / 2;
  const ctrY = size / 2;
  const maxRadius = size / 2 - 30;
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingAxisRef = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ level: number } | null>(null);
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);

  const isInteractive = !!onAxisChange;

  // 드래그 중 touchmove 스크롤 방지 (touch-action CSS fallback)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !isInteractive) return;
    const handler = (e: TouchEvent) => {
      if (draggingAxisRef.current !== null) e.preventDefault();
    };
    svg.addEventListener('touchmove', handler, { passive: false });
    return () => svg.removeEventListener('touchmove', handler);
  }, [isInteractive]);

  const valuePoints = useMemo(
    () =>
      TASTING_AXES.map((axis, i) => {
        const ratio = values[axis.key] / TASTING_MAX_VALUE;
        return polarToCartesian(ctrX, ctrY, maxRadius * ratio, i);
      }),
    [values, ctrX, ctrY, maxRadius],
  );

  const badgePoints = useMemo(
    () =>
      TASTING_AXES.map((axis, i) => {
        const ratio = values[axis.key] / TASTING_MAX_VALUE;
        const displayRatio = Math.max(MIN_DISPLAY_RATIO, ratio);
        return polarToCartesian(ctrX, ctrY, maxRadius * displayRatio, i);
      }),
    [values, ctrX, ctrY, maxRadius],
  );

  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLevels = Array.from({ length: TASTING_MAX_VALUE }, (_, i) => i + 1);

  const toSvgCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (size / rect.width),
        y: (clientY - rect.top) * (size / rect.height),
      };
    },
    [size],
  );

  const showFeedback = useCallback((level: number) => {
    setFeedback({ level });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const endDrag = useCallback(() => {
    if (draggingAxisRef.current === null) return;
    draggingAxisRef.current = null;
    setDraggingIdx(null);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 500);
  }, []);

  // 드래그 시작: 배지 pointerdown
  const handleBadgePointerDown = useCallback(
    (e: React.PointerEvent, axisIndex: number) => {
      if (!isInteractive) return;
      e.preventDefault();
      e.stopPropagation();

      // setPointerCapture → 드래그 중 이벤트를 SVG로 라우팅 + 스크롤 억제
      svgRef.current?.setPointerCapture(e.pointerId);
      draggingAxisRef.current = axisIndex;
      setDraggingIdx(axisIndex);

      // 초기 값 즉시 적용
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      const val = projectOntoAxis(x, y, ctrX, ctrY, axisIndex, maxRadius);
      onAxisChange!(TASTING_AXES[axisIndex].key, val);
      showFeedback(val);
    },
    [
      isInteractive,
      toSvgCoords,
      ctrX,
      ctrY,
      maxRadius,
      onAxisChange,
      showFeedback,
    ],
  );

  // 드래그 중: SVG pointermove
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const idx = draggingAxisRef.current;
      if (idx === null) return;
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      const val = projectOntoAxis(x, y, ctrX, ctrY, idx, maxRadius);
      onAxisChange!(TASTING_AXES[idx].key, val);
      showFeedback(val);
    },
    [toSvgCoords, ctrX, ctrY, maxRadius, onAxisChange, showFeedback],
  );

  // 빈 영역 탭: 가장 가까운 축에 값 설정 (onPointerUp → 스크롤과 자연 구분)
  const handleChartTap = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteractive || draggingAxisRef.current !== null) return;
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      const closestIdx = findClosestAxis(x, y, ctrX, ctrY);
      const newValue = pointerToAxisValue(x, y, ctrX, ctrY, maxRadius);
      onAxisChange!(TASTING_AXES[closestIdx].key, newValue);

      showFeedback(newValue);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 800);
    },
    [
      isInteractive,
      toSvgCoords,
      ctrX,
      ctrY,
      maxRadius,
      onAxisChange,
      showFeedback,
    ],
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
      onPointerMove={isInteractive ? handlePointerMove : undefined}
      onPointerUp={isInteractive ? endDrag : undefined}
      onPointerCancel={isInteractive ? endDrag : undefined}
      onLostPointerCapture={isInteractive ? endDrag : undefined}
    >
      {/* SVG 필터 정의 */}
      <defs>
        <filter id="badge-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor="#000"
            floodOpacity="0.1"
          />
        </filter>
        <filter id="badge-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="3"
            floodColor="#E58257"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      {/* 배경 격자 */}
      {gridLevels.map((level) => {
        const radius = (maxRadius * level) / TASTING_MAX_VALUE;
        return (
          <polygon
            key={level}
            points={buildPolygonPoints(ctrX, ctrY, radius, AXIS_COUNT)}
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
          const px = ctrX + radius * Math.cos(angle);
          const py = ctrY + radius * Math.sin(angle);

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
        const { x, y } = polarToCartesian(ctrX, ctrY, maxRadius, i);
        return (
          <line
            key={`axis-${axis.key}`}
            x1={ctrX}
            y1={ctrY}
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

      {/* 값 배지 (시각적 레이어) */}
      {badgePoints.map((p, i) => (
        <ValueBadge
          key={TASTING_AXES[i].key}
          targetX={p.x}
          targetY={p.y}
          value={values[TASTING_AXES[i].key]}
          isActive={activeAxis === TASTING_AXES[i].key}
          isDragging={draggingIdx === i}
        />
      ))}

      {/* 축 라벨 (한글) */}
      {TASTING_AXES.map((axis, i) => {
        const { x, y } = polarToCartesian(ctrX, ctrY, maxRadius + 20, i);
        return (
          <text
            key={axis.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-mainDarkGray"
            fontSize={11}
            fontWeight={
              activeAxis === axis.key || draggingIdx === i ? 700 : 600
            }
            style={{ pointerEvents: 'none' }}
          >
            {axis.labelKo}
          </text>
        );
      })}

      {/* 탭 히트 영역 — 빈 곳 터치 시 가장 가까운 축에 값 설정 */}
      {isInteractive && (
        <circle
          cx={ctrX}
          cy={ctrY}
          r={maxRadius + 10}
          fill="transparent"
          cursor="pointer"
          onPointerUp={handleChartTap}
        />
      )}

      {/* 배지 히트 영역 (최상위 — touch-action: none으로 스크롤 방지) */}
      {isInteractive &&
        badgePoints.map((p, i) => (
          <circle
            key={`hit-${TASTING_AXES[i].key}`}
            cx={p.x}
            cy={p.y}
            r={BADGE_HIT_RADIUS}
            fill="transparent"
            cursor="grab"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => handleBadgePointerDown(e, i)}
          />
        ))}

      {/* 드래그 중 레벨 설명 (차트 중앙) */}
      <AnimatePresence>
        {feedback && (
          <motion.text
            x={ctrX}
            y={ctrY}
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
            {LEVEL_DESCRIPTIONS[feedback.level]}
          </motion.text>
        )}
      </AnimatePresence>
    </svg>
  );
}
