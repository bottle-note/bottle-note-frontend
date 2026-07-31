import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  TarotPromoCard,
  TAROT_PROMO_CLOSED_KEY,
} from '@/components/feature/home/TarotPromoCard';

describe('TarotPromoCard', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('닫기 클릭 시 localStorage에 닫힘 값을 저장하고 배너를 숨긴다', () => {
    render(<TarotPromoCard />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(localStorage.getItem(TAROT_PROMO_CLOSED_KEY)).toBe('true');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(
      screen.queryByText('위스키와 함께하는 타로점'),
    ).not.toBeInTheDocument();
  });

  it('localStorage에 닫힘 값이 있으면 배너를 렌더링하지 않는다', () => {
    localStorage.setItem(TAROT_PROMO_CLOSED_KEY, 'true');

    render(<TarotPromoCard />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(
      screen.queryByText('위스키와 함께하는 타로점'),
    ).not.toBeInTheDocument();
  });

  it('테마에 따라 바뀌는 배경과 텍스트 역할 토큰을 사용한다', () => {
    render(<TarotPromoCard />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(
      screen.getByText('위스키와 함께하는 타로점').closest('a'),
    ).toHaveClass('bg-bg-brand-weak');
    expect(screen.getByText('위스키와 함께하는 타로점')).toHaveClass(
      'text-fg-brand',
    );
    expect(
      screen.getByText('타로 카드를 뽑아 추천 위스키를 점쳐보세요.'),
    ).toHaveClass('text-fg-neutral-muted');
  });
});
