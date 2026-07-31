import { render, screen } from '@testing-library/react';
import AlcoholInfo from './AlcoholInfo';

describe('Review AlcoholInfo', () => {
  it('빈 위스키 이미지 영역에 시맨틱 배경을 사용한다', () => {
    render(<AlcoholInfo onSelectAlcohol={jest.fn()} />);

    expect(screen.getByRole('button', { name: '위스키 선택' })).toHaveClass(
      'bg-bg-neutral-weak',
      'border-stroke-neutral-subtle',
    );
  });
});
