import { render, screen } from '@testing-library/react';
import Star from './Star';

describe('Star', () => {
  it('기존 별 SVG 형태에 시맨틱 평점 색상을 입힌다', () => {
    render(<Star rating={4.5} />);

    const rating = screen.getByText('4.5');
    const star = rating.parentElement?.querySelector(
      '[data-semantic-icon="/icon/star-filled-subcoral.svg"]',
    );

    expect(rating.parentElement).toHaveClass('text-fg-rating');
    expect(star).toBeInTheDocument();
  });

  it('브랜드 배경 위에서는 브랜드 대비 색상을 사용한다', () => {
    render(<Star rating={4} tone="brandContrast" />);

    expect(screen.getByText('4.0').parentElement).toHaveClass(
      'text-fg-brand-contrast',
    );
    expect(
      screen
        .getByText('4.0')
        .parentElement?.querySelector(
          '[data-semantic-icon="/icon/star-filled-white.svg"]',
        ),
    ).toBeInTheDocument();
  });
});
