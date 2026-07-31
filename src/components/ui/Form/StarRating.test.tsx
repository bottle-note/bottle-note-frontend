import { fireEvent, render, screen } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('기존 별점 SVG 형태를 유지하고 시맨틱 평점 색상을 사용한다', () => {
    const handleRate = jest.fn();

    render(<StarRating rate={2.5} handleRate={handleRate} />);

    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
    stars.forEach((star) => {
      expect(star).toHaveClass('text-fg-rating');
      expect(star.querySelector('img')).not.toBeInTheDocument();
    });

    expect(
      stars[0].querySelector(
        '[data-semantic-icon="/icon/star-filled-subcoral.svg"]',
      ),
    ).toBeInTheDocument();
    expect(
      stars[2].querySelector(
        '[data-semantic-icon="/icon/star-half-subcoral.svg"]',
      ),
    ).toBeInTheDocument();
    expect(
      stars[3].querySelector(
        '[data-semantic-icon="/icon/star-outlined-subcoral.svg"]',
      ),
    ).toBeInTheDocument();

    fireEvent.keyDown(stars[3], { key: 'Enter' });
    expect(handleRate).toHaveBeenCalledWith(4);
  });
});
