import { render, screen } from '@testing-library/react';
import { PicksListItem } from './PicksListItem';
import { RatingsListItem } from './RatingsListItem';
import { ReviewListItem } from './ReviewListItem';

jest.mock('@/components/feature/List/_components/ItemImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/domain/alcohol/AlcoholPickButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: () => ({ handleLoginModal: jest.fn() }),
}));

const baseMyBottleInfo = {
  alcoholId: 1,
  alcoholKorName: '테스트 위스키',
  alcoholEngName: 'Test Whisky',
  korCategoryName: '싱글 몰트',
  imageUrl: 'https://example.com/whisky.jpg',
  isHot: false,
};

describe('MyBottle list items', () => {
  it('별점 항목의 본문, 보조 정보, 구분선에 시맨틱 색상 토큰을 사용한다', () => {
    render(
      <RatingsListItem
        data={{
          baseMyBottleInfo,
          myRatingPoint: 4,
          averageRatingPoint: 3.5,
          averageRatingCount: 12,
          ratingModifyAt: '2026-07-31',
        }}
        isMyPage
      />,
    );

    expect(screen.getByText('내 별점').closest('section')).toHaveClass(
      'border-stroke-neutral-subtle',
      'text-fg-neutral',
    );
    expect(screen.getByText('내 별점')).toHaveClass('text-fg-neutral-muted');
    expect(screen.getByText('3.5').parentElement).toHaveClass(
      'text-fg-neutral-muted',
    );
    expect(screen.getByText('4.0')).toHaveClass('text-fg-brand-primary');
  });

  it('리뷰 본문과 날짜를 보조 텍스트 색상으로 표시한다', () => {
    render(
      <ReviewListItem
        data={{
          baseMyBottleInfo,
          reviewId: 1,
          isMyReview: true,
          reviewModifyAt: '2026-07-31',
          reviewContent: '다크 모드에서도 읽을 수 있는 리뷰',
          reviewTastingTags: [],
          isBestReview: false,
        }}
      />,
    );

    const review = screen.getByText('[다크 모드에서도 읽을 수 있는 리뷰]');

    expect(review.closest('section')).toHaveClass(
      'border-stroke-neutral-subtle',
      'text-fg-neutral',
    );
    expect(review).toHaveClass('text-fg-neutral-muted');
    expect(screen.getByText('2026.07.31')).toHaveClass('text-fg-neutral-muted');
  });

  it('찜 항목의 통계와 관계 표시를 보조 텍스트 색상으로 표시한다', () => {
    render(
      <PicksListItem
        data={{
          baseMyBottleInfo,
          isPicked: true,
          totalPicksCount: 8,
        }}
        isMyPage={false}
      />,
    );

    expect(screen.getByText('통했찜').closest('section')).toHaveClass(
      'border-stroke-neutral-subtle',
      'text-fg-neutral',
    );
    expect(screen.getByText('통했찜')).toHaveClass('text-fg-neutral-muted');
    expect(screen.getByText('찜').parentElement).toHaveClass(
      'text-fg-neutral-muted',
    );
  });
});
