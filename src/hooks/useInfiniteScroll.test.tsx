import { render, screen } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface HarnessProps {
  fetchNextPage: () => void;
  showTarget: boolean;
  throttleMs?: number;
}

const Harness = ({ fetchNextPage, showTarget, throttleMs }: HarnessProps) => {
  const { targetRef } = useInfiniteScroll({
    fetchNextPage,
    throttleMs,
  });

  return showTarget ? (
    <div ref={targetRef} data-testid="scroll-target" />
  ) : null;
};

describe('useInfiniteScroll', () => {
  const observe = jest.fn();
  const unobserve = jest.fn();
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    window.IntersectionObserver = jest
      .fn()
      .mockImplementation((callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        return {
          observe,
          unobserve,
        };
      });
  });

  it('마운트가 늦어진 target도 관찰한다', () => {
    const fetchNextPage = jest.fn();
    const { rerender } = render(
      <Harness fetchNextPage={fetchNextPage} showTarget={false} />,
    );

    rerender(<Harness fetchNextPage={fetchNextPage} showTarget />);

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(screen.getByTestId('scroll-target'));
  });

  it('같은 교차 구간에서는 한 번만 요청하고 재진입 시 다시 요청한다', () => {
    const fetchNextPage = jest.fn();
    const { rerender } = render(
      <Harness fetchNextPage={fetchNextPage} showTarget throttleMs={0} />,
    );

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    observerCallback(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });
});
