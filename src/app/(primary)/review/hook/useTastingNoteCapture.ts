'use client';

import {
  TASTING_AXES,
  type TastingNoteValues,
  isTastingNoteEmpty,
} from '@/constants/tastingNote';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const OUTPUT_SCALE = 4;

function getChartSize(svg: SVGSVGElement): number {
  const size = Number(svg.getAttribute('viewBox')?.split(/\s+/)[2]);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('테이스팅 차트 크기를 확인할 수 없습니다.');
  }
  return size;
}

function resolveBackgroundColor(): string {
  const probe = document.createElement('span');
  probe.style.color = 'var(--color-bg-layer-default)';
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** 완료 미리보기의 실제 SVG를 이미지에서도 동일하게 보이도록 독립형 SVG로 만든다. */
export function serializeTastingNotePreview(svg: SVGSVGElement): string {
  const size = getChartSize(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(size));
  clone.setAttribute('height', String(size));

  const sourceNodes = [svg, ...Array.from(svg.querySelectorAll('*'))];
  const clonedNodes = [clone, ...Array.from(clone.querySelectorAll('*'))];

  sourceNodes.forEach((source, index) => {
    const target = clonedNodes[index];
    const style = getComputedStyle(source);

    if (style.fill) target.setAttribute('fill', style.fill);
    if (style.stroke) target.setAttribute('stroke', style.stroke);

    if (source.tagName.toLowerCase() === 'text') {
      target.setAttribute('font-family', style.fontFamily);
      target.setAttribute('font-size', style.fontSize);
      target.setAttribute('font-weight', style.fontWeight);
    }

    if (source.tagName.toLowerCase() === 'fedropshadow') {
      const floodColor = style.getPropertyValue('flood-color');
      if (floodColor) target.setAttribute('flood-color', floodColor);
    }
  });

  const background = document.createElementNS(SVG_NAMESPACE, 'rect');
  background.setAttribute('width', String(size));
  background.setAttribute('height', String(size));
  background.setAttribute('fill', resolveBackgroundColor());
  clone.insertBefore(background, clone.firstChild);

  return new XMLSerializer().serializeToString(clone);
}

async function svgToFile(
  svgString: string,
  size: number,
): Promise<File | null> {
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size * OUTPUT_SCALE;
      canvas.height = size * OUTPUT_SCALE;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      ctx.scale(OUTPUT_SCALE, OUTPUT_SCALE);
      ctx.drawImage(img, 0, 0, size, size);
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

/** 작성 완료 화면에 렌더링된 차트를 PNG 파일로 캡처한다. */
export async function captureTastingNote(
  values: TastingNoteValues | null | undefined,
): Promise<File | null> {
  if (!values || isTastingNoteEmpty(values)) return null;

  try {
    const preview = document.querySelector<SVGSVGElement>(
      '[data-tasting-note-preview] svg',
    );
    const signature = TASTING_AXES.map((axis) => values[axis.key]).join(',');

    if (preview?.getAttribute('data-tasting-note-values') !== signature) {
      throw new Error(
        '테이스팅 차트 미리보기가 현재 입력과 일치하지 않습니다.',
      );
    }

    return await svgToFile(
      serializeTastingNotePreview(preview),
      getChartSize(preview),
    );
  } catch (error) {
    console.error('테이스팅 노트 이미지 생성 실패:', error);
    return null;
  }
}
