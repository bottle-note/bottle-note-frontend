import { render } from '@testing-library/react';
import TastingRadarChart from '../_components/form/TastingRadarChart';
import { serializeTastingNotePreview } from './useTastingNoteCapture';

const values = {
  smoky: 5,
  fruity: 3,
  floral: 2,
  sweet: 4,
  spicy: 1,
  body: 3,
};

it('완료 차트의 도형, 점수와 한글 축 라벨을 저장용 SVG에 그대로 담는다', () => {
  const { container } = render(
    <div data-tasting-note-preview>
      <TastingRadarChart values={values} size={180} />
    </div>,
  );
  const preview = container.querySelector('svg') as SVGSVGElement;
  const svgString = serializeTastingNotePreview(preview);
  const parsed = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  if (parsed.querySelector('parsererror')) {
    throw new Error(
      `${parsed.querySelector('parsererror')?.textContent}\n${svgString.slice(0, 500)}`,
    );
  }
  const saved = parsed.querySelector('svg') as SVGSVGElement;

  expect(saved.getAttribute('viewBox')).toBe(preview.getAttribute('viewBox'));
  expect(saved.querySelectorAll('polygon').length).toBe(
    preview.querySelectorAll('polygon').length,
  );
  expect(
    Array.from(saved.querySelectorAll('polygon')).map((polygon) =>
      polygon.getAttribute('points'),
    ),
  ).toEqual(
    Array.from(preview.querySelectorAll('polygon')).map((polygon) =>
      polygon.getAttribute('points'),
    ),
  );
  expect(
    Array.from(saved.querySelectorAll('text')).map(
      (label) => label.textContent,
    ),
  ).toEqual(
    Array.from(preview.querySelectorAll('text')).map(
      (label) => label.textContent,
    ),
  );
  expect(saved.textContent).toContain('꽃/허브');
  expect(saved.querySelectorAll('circle').length).toBe(
    preview.querySelectorAll('circle').length,
  );
});
