// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import HistoryOverview from './HistoryOverview';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HistoryOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('통계 영역에 테마 대응 색상 토큰을 사용한다', () => {
    render(<HistoryOverview rates={7} reviews={15} likes={19} id={6} />);

    expect(screen.getByText('별점').closest('article')).toHaveClass(
      'divide-stroke-neutral-weak',
      'border-stroke-brand-solid',
      'text-fg-neutral',
    );
    expect(screen.getByText('7')).toHaveClass('text-fg-brand');
  });

  it('통계를 누르면 해당 보틀 목록으로 이동한다', () => {
    render(<HistoryOverview rates={7} reviews={15} likes={19} id={6} />);

    fireEvent.click(screen.getByRole('button', { name: '15 리뷰' }));

    expect(mockPush).toHaveBeenCalledWith('/user/6/my-bottle?type=reviews');
  });
});
