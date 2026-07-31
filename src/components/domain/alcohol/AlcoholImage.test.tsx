import { render, screen } from '@testing-library/react';
import AlcoholImage from './AlcoholImage';

describe('AlcoholImage', () => {
  it('기본 이미지 표면에 시맨틱 배경을 사용한다', () => {
    render(<AlcoholImage imageUrl="/bottle.svg" />);

    expect(
      screen.getByAltText('alcohol image').closest('.bg-bg-neutral-weak'),
    ).not.toBeNull();
  });
});
