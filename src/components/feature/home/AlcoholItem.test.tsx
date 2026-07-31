import { render, screen } from '@testing-library/react';
import type { Alcohol } from '@/api/alcohol/types';
import AlcoholItem from './AlcoholItem';

const alcohol: Alcohol = {
  alcoholId: 1,
  korName: '달모어 15년',
  engName: 'The Dalmore 15',
  korCategory: '싱글 몰트',
  engCategory: 'Single Malt',
  imageUrl: 'https://example.com/dalmore.jpg',
  rating: 4.3,
  ratingCount: 12,
  isPicked: false,
};

describe('AlcoholItem', () => {
  it('카드 표면과 텍스트에 테마 역할 토큰을 사용한다', () => {
    render(<AlcoholItem data={alcohol} />);

    expect(screen.getByText('달모어 15년')).toHaveClass('text-fg-neutral');
    expect(screen.getByText('달모어 15년').parentElement).toHaveClass(
      'bg-bg-layer-floating',
    );
    expect(screen.getByText('4.3').parentElement).toHaveClass('text-fg-rating');
    expect(
      screen
        .getByText('4.3')
        .parentElement?.querySelector(
          '[data-semantic-icon="/icon/star-filled-subcoral.svg"]',
        ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('SINGLE MALT').closest('.text-fg-brand'),
    ).not.toBeNull();
  });
});
