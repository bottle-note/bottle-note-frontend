import { render, screen } from '@testing-library/react';
import AlcoholImage from './AlcoholImage';

describe('AlcoholImage', () => {
  it('기본 이미지 표면에 고정 흰색 배경을 사용한다', () => {
    render(<AlcoholImage imageUrl="/bottle.svg" />);

    expect(
      screen.getByAltText('alcohol image').closest('.bg-palette-static-white'),
    ).not.toBeNull();
  });
});
