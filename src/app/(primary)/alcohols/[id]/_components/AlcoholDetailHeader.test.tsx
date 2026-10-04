import { fireEvent, render, screen } from '@testing-library/react';
import type { AlcoholInfo } from '@/types/Alcohol';
import AlcoholDetailHeader from './AlcoholDetailHeader';

const mockHandleReviewWrite = jest.fn();

jest.mock('@/hooks/useNavigateReviewWrite', () => ({
  useNavigateReviewWrite: () => ({ handleReviewWrite: mockHandleReviewWrite }),
}));
jest.mock('@/components/domain/alcohol/AlcoholImage', () => () => null);
jest.mock('@/components/domain/alcohol/AlcoholPickButton', () => () => null);

const alcohol: AlcoholInfo = {
  alcoholId: 42,
  alcoholUrlImg: '/bottle.png',
  korName: '테스트 위스키',
  engName: 'Test Whisky',
  korCategory: '위스키',
  engCategory: 'Whisky',
  korRegion: '스코틀랜드',
  engRegion: 'Scotland',
  cask: '-',
  abv: '40',
  korDistillery: '-',
  engDistillery: '-',
  rating: 4,
  myAvgRating: 0,
  myRating: 0,
  totalRatingsCount: 12,
  isPicked: false,
  alcoholsTastingTags: null,
};

it('세션 복원 중에는 리뷰 작성으로 이동하지 않고, 복원 후에는 이동한다', () => {
  const renderHeader = (isAuthLoading: boolean) => (
    <AlcoholDetailHeader
      data={alcohol}
      isPicked={false}
      setIsPicked={jest.fn()}
      isAuthLoading={isAuthLoading}
    />
  );
  const { rerender } = render(renderHeader(true));
  const writeButton = screen.getByRole('button', { name: '리뷰 작성' });

  expect(writeButton).toBeDisabled();
  fireEvent.click(writeButton);
  expect(mockHandleReviewWrite).not.toHaveBeenCalled();

  rerender(renderHeader(false));
  fireEvent.click(writeButton);
  expect(mockHandleReviewWrite).toHaveBeenCalledWith(42);
});
