import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';
import { useWhiskeyExploreSearch } from './useWhiskeyExploreSearch';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;

const parseReplacedQuery = (mockReplace: jest.Mock) => {
  const [url] = mockReplace.mock.calls.at(-1);
  return new URLSearchParams(url.split('?')[1] ?? '');
};

describe('useWhiskeyExploreSearch', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace = jest.fn();
    mockUsePathname.mockReturnValue('/explore');
    mockUseRouter.mockReturnValue({ replace: mockReplace });
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=EXPLORER_WHISKEY&regionIds=12&category=SINGLE_MALT',
      ),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('300ms 동안 추가 입력이 없을 때만 정규화된 검색어를 반영한다', () => {
    const { result } = renderHook(() => useWhiskeyExploreSearch());

    act(() => result.current.setInputKeyword('  mac   allan  '));

    expect(result.current.inputKeyword).toBe('  mac   allan  ');
    expect(result.current.debouncedKeyword).toBe('');
    expect(result.current.isTyping).toBe(true);

    act(() => jest.advanceTimersByTime(299));
    expect(result.current.debouncedKeyword).toBe('');
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));

    expect(result.current.debouncedKeyword).toBe('mac allan');
    expect(result.current.isTyping).toBe(false);
    expect(mockReplace).toHaveBeenCalledTimes(1);

    const params = parseReplacedQuery(mockReplace);
    expect(params.getAll('keywords')).toEqual(['mac allan']);
    expect(params.getAll('regionIds')).toEqual(['12']);
    expect(params.get('category')).toBe('SINGLE_MALT');
    expect(params.get('tab')).toBe('EXPLORER_WHISKEY');
  });

  it.each(['m', '맥', 'ㅁ'])(
    '공백이 아닌 1글자 %s도 검색어로 허용한다',
    (keyword) => {
      const { result } = renderHook(() => useWhiskeyExploreSearch());

      act(() => result.current.setInputKeyword(keyword));
      act(() => jest.advanceTimersByTime(300));

      expect(result.current.debouncedKeyword).toBe(keyword);
      expect(parseReplacedQuery(mockReplace).getAll('keywords')).toEqual([
        keyword,
      ]);
    },
  );

  it('빠르게 입력하면 마지막 검색어만 한 번 반영한다', () => {
    const { result } = renderHook(() => useWhiskeyExploreSearch());

    act(() => result.current.setInputKeyword('m'));
    act(() => jest.advanceTimersByTime(150));
    act(() => result.current.setInputKeyword('ma'));
    act(() => jest.advanceTimersByTime(150));
    act(() => result.current.setInputKeyword('mac'));
    act(() => jest.advanceTimersByTime(300));

    expect(result.current.debouncedKeyword).toBe('mac');
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(parseReplacedQuery(mockReplace).getAll('keywords')).toEqual(['mac']);
  });

  it('입력값을 비우면 keywords만 제거하고 필터를 보존한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12&category=SINGLE_MALT',
      ),
    );
    const { result } = renderHook(() => useWhiskeyExploreSearch());

    act(() => result.current.setInputKeyword(''));
    act(() => jest.advanceTimersByTime(300));

    const params = parseReplacedQuery(mockReplace);
    expect(params.has('keywords')).toBe(false);
    expect(params.getAll('regionIds')).toEqual(['12']);
    expect(params.get('category')).toBe('SINGLE_MALT');
  });

  it('리뷰 탭에서 넘어온 keywords는 위스키 검색어로 복원하지 않는다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=REVIEW_WHISKEY&keywords=stale-review-keyword&regionIds=12',
      ),
    );

    const { result } = renderHook(() => useWhiskeyExploreSearch());

    expect(result.current.inputKeyword).toBe('');
    expect(result.current.debouncedKeyword).toBe('');
  });
});
