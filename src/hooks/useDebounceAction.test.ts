// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';
import useDebounceAction from './useDebounceAction';

describe('useDebounceAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('화면 이탈 전 대기 중인 마지막 동작을 즉시 실행한다', () => {
    const saveRating = jest.fn();
    const { result, unmount } = renderHook(() =>
      useDebounceAction(2000, { flushOnUnmount: true }),
    );

    act(() => result.current.debounce(saveRating));
    expect(saveRating).not.toHaveBeenCalled();

    act(() => unmount());
    expect(saveRating).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(2000));
    expect(saveRating).toHaveBeenCalledTimes(1);
  });

  it('flush 옵션이 없으면 화면 이탈 시 대기 중인 동작을 취소한다', () => {
    const saveToggle = jest.fn();
    const { result, unmount } = renderHook(() => useDebounceAction(2000));

    act(() => result.current.debounce(saveToggle));
    act(() => unmount());
    act(() => jest.advanceTimersByTime(2000));

    expect(saveToggle).not.toHaveBeenCalled();
  });

  it('연속 변경에서는 마지막 동작만 한 번 실행한다', () => {
    const firstSave = jest.fn();
    const lastSave = jest.fn();
    const { result } = renderHook(() => useDebounceAction(2000));

    act(() => result.current.debounce(firstSave));
    act(() => jest.advanceTimersByTime(1000));
    act(() => result.current.debounce(lastSave));
    act(() => jest.advanceTimersByTime(2000));

    expect(firstSave).not.toHaveBeenCalled();
    expect(lastSave).toHaveBeenCalledTimes(1);
  });
});