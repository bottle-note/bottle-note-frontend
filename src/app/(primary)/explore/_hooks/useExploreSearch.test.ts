import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';
import { useExploreSearch } from './useExploreSearch';
import {
  REVIEW_EXPLORE_TAB_ID,
  WHISKEY_EXPLORE_TAB_ID,
} from '../_constants/exploreTabs';

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

describe('useExploreSearch', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace = jest.fn();
    mockUsePathname.mockReturnValue('/explore');
    mockUseRouter.mockReturnValue({ replace: mockReplace });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('리뷰 검색은 300ms 뒤 단일 keyword를 URL에 반영하고 필터를 보존한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=REVIEW_WHISKEY&rating=4.5'),
    );
    const { result } = renderHook(() =>
      useExploreSearch({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    act(() => result.current.setInputKeyword('  피트   향  '));
    act(() => jest.advanceTimersByTime(299));

    expect(result.current.debouncedKeyword).toBe('');
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));

    expect(result.current.debouncedKeyword).toBe('피트 향');
    expect(result.current.isTyping).toBe(false);
    const params = parseReplacedQuery(mockReplace);
    expect(params.get('keyword')).toBe('피트 향');
    expect(params.has('keywords')).toBe(false);
    expect(params.get('rating')).toBe('4.5');
  });

  it.each(['m', '맥', 'ㅁ'])(
    '리뷰에서 공백이 아닌 1글자 %s도 검색한다',
    (keyword) => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams('tab=REVIEW_WHISKEY'),
      );
      const { result } = renderHook(() =>
        useExploreSearch({ tabId: REVIEW_EXPLORE_TAB_ID }),
      );

      act(() => result.current.setInputKeyword(keyword));
      act(() => jest.advanceTimersByTime(300));

      expect(result.current.debouncedKeyword).toBe(keyword);
      expect(parseReplacedQuery(mockReplace).get('keyword')).toBe(keyword);
    },
  );

  it('리뷰 입력을 비우면 keyword만 제거하고 정렬값을 보존한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=REVIEW_WHISKEY&keyword=peaty&sortType=RATING&sortOrder=ASC',
      ),
    );
    const { result } = renderHook(() =>
      useExploreSearch({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    act(() => result.current.setInputKeyword(''));
    act(() => jest.advanceTimersByTime(300));

    const params = parseReplacedQuery(mockReplace);
    expect(params.has('keyword')).toBe(false);
    expect(params.get('sortType')).toBe('RATING');
    expect(params.get('sortOrder')).toBe('ASC');
  });

  it('위스키 검색은 기존 repeated keywords URL 계약을 유지한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=EXPLORER_WHISKEY&keywords=macallan&sortType=RATING&sortOrder=DESC',
      ),
    );

    const { result } = renderHook(() =>
      useExploreSearch({ tabId: WHISKEY_EXPLORE_TAB_ID }),
    );

    expect(result.current.inputKeyword).toBe('macallan');
    expect(result.current.debouncedKeyword).toBe('macallan');
  });

  it('다른 탭의 검색어는 현재 탭 입력값으로 복원하지 않는다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=EXPLORER_WHISKEY&keywords=stale-whiskey'),
    );

    const { result } = renderHook(() =>
      useExploreSearch({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    expect(result.current.inputKeyword).toBe('');
    expect(result.current.debouncedKeyword).toBe('');
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
