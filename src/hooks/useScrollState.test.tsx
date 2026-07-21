// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';
import { useScrollState } from './useScrollState';

jest.mock('@/utils/throttle', () => ({
  throttle: (handler: () => void) => handler,
}));

const setScrollMetrics = ({
  scrollY,
  scrollHeight,
  innerHeight = 800,
}: {
  scrollY: number;
  scrollHeight: number;
  innerHeight?: number;
}) => {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: innerHeight,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

const dispatchScroll = () => {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
};

describe('useScrollState', () => {
  beforeEach(() => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 1300 });
  });

  it('짧은 목록에서는 실제 스크롤 범위에 맞춰 숨김 기준을 낮춘다', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 870 });
    const { result } = renderHook(() => useScrollState(100));

    setScrollMetrics({ scrollY: 40, scrollHeight: 870 });
    dispatchScroll();

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isAtTop).toBe(false);
  });

  it('목록 축소로 scrollY가 보정되면 위쪽 스크롤로 오인하지 않는다', () => {
    const { result } = renderHook(() => useScrollState(100));

    setScrollMetrics({ scrollY: 150, scrollHeight: 1300 });
    dispatchScroll();
    expect(result.current.isVisible).toBe(false);

    setScrollMetrics({ scrollY: 70, scrollHeight: 870 });
    dispatchScroll();

    expect(result.current.isVisible).toBe(false);
  });

  it('스크롤할 수 없는 목록에서는 UI를 표시한다', () => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 800 });
    const { result } = renderHook(() => useScrollState(100));

    dispatchScroll();

    expect(result.current).toEqual({ isVisible: true, isAtTop: true });
  });
});
