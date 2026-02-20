'use client';

import {
  TASTING_AXES,
  TASTING_MAX_VALUE,
  type TastingNoteValues,
  isTastingNoteEmpty,
} from '@/constants/tastingNote';

const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2;
const MAX_RADIUS = SVG_SIZE / 2 - 50;
const AXIS_COUNT = TASTING_AXES.length;
const ANGLE_OFFSET = -Math.PI / 2;

function polar(radius: number, index: number) {
  const angle = (2 * Math.PI * index) / AXIS_COUNT + ANGLE_OFFSET;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function polygonPoints(radius: number): string {
  return Array.from({ length: AXIS_COUNT })
    .map((_, i) => {
      const { x, y } = polar(radius, i);
      return `${x},${y}`;
    })
    .join(' ');
}

/**
 * TastingNoteValues → SVG 문자열 (인라인 스타일, DOM 불필요)
 */
function generateSvgString(values: TastingNoteValues): string {
  const gridLines = Array.from({ length: TASTING_MAX_VALUE }, (_, i) => i + 1)
    .map((level) => {
      const r = (MAX_RADIUS * level) / TASTING_MAX_VALUE;
      const sw = level === TASTING_MAX_VALUE ? 1.5 : 0.8;
      const op = level === TASTING_MAX_VALUE ? 0.8 : 0.5;
      return `<polygon points="${polygonPoints(r)}" fill="none" stroke="#E6E6DD" stroke-width="${sw}" opacity="${op}"/>`;
    })
    .join('');

  const axisLines = TASTING_AXES.map((_, i) => {
    const { x, y } = polar(MAX_RADIUS, i);
    return `<line x1="${CENTER}" y1="${CENTER}" x2="${x}" y2="${y}" stroke="#E6E6DD" stroke-width="0.8" opacity="0.6"/>`;
  }).join('');

  const valuePoints = TASTING_AXES.map((axis, i) => {
    const ratio = values[axis.key] / TASTING_MAX_VALUE;
    return polar(MAX_RADIUS * ratio, i);
  });

  const valuePoly = valuePoints.map((p) => `${p.x},${p.y}`).join(' ');

  const dots = valuePoints
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#E58257" stroke="#fff" stroke-width="2"/>`,
    )
    .join('');

  const labels = TASTING_AXES.map((axis, i) => {
    const { x, y } = polar(MAX_RADIUS + 28, i);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#252525" font-size="13" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${axis.label}</text>`;
  }).join('');

  const subLabels = TASTING_AXES.map((axis, i) => {
    const { x, y } = polar(MAX_RADIUS + 42, i);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#666666" font-size="10" font-family="system-ui, -apple-system, sans-serif">${axis.labelKo}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">
    <rect width="${SVG_SIZE}" height="${SVG_SIZE}" fill="white"/>
    ${gridLines}
    ${axisLines}
    <polygon points="${valuePoly}" fill="#EF9A6E" fill-opacity="0.25" stroke="#E58257" stroke-width="2.5"/>
    ${dots}
    ${labels}
    ${subLabels}
  </svg>`;
}

/**
 * SVG 문자열 → Canvas → PNG File
 */
async function svgToFile(svgString: string): Promise<File | null> {
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = SVG_SIZE * scale;
      canvas.height = SVG_SIZE * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, SVG_SIZE, SVG_SIZE);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (pngBlob) => {
          if (!pngBlob) {
            resolve(null);
            return;
          }
          resolve(
            new File([pngBlob], `tasting-note-${Date.now()}.png`, {
              type: 'image/png',
            }),
          );
        },
        'image/png',
        1.0,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * 테이스팅 노트 데이터 → PNG 이미지 File
 * DOM 의존성 없이 순수 데이터에서 이미지를 생성
 */
export async function captureTastingNote(
  values: TastingNoteValues | null | undefined,
): Promise<File | null> {
  if (!values || isTastingNoteEmpty(values)) return null;

  try {
    const svgString = generateSvgString(values);
    return await svgToFile(svgString);
  } catch (error) {
    console.error('테이스팅 노트 이미지 생성 실패:', error);
    return null;
  }
}
