import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook } from '@testing-library/react';
import { useExploreSort } from './useExploreSort';
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

describe('useExploreSort', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace = jest.fn();
    mockUsePathname.mockReturnValue('/explore');
    mockUseRouter.mockReturnValue({ replace: mockReplace });
  });

  it('URL 정렬값이 없으면 위스키는 랜덤, 리뷰는 최신순을 기본값으로 사용한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=EXPLORER_WHISKEY'),
    );
    const { result: whiskeyResult } = renderHook(() =>
      useExploreSort({ tabId: WHISKEY_EXPLORE_TAB_ID }),
    );

    expect(whiskeyResult.current.selectedSort).toMatchObject({
      id: 'RANDOM_DESC',
      sortType: 'RANDOM',
      sortOrder: 'DESC',
    });

    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=REVIEW_WHISKEY'),
    );
    const { result: reviewResult } = renderHook(() =>
      useExploreSort({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    expect(reviewResult.current.selectedSort).toMatchObject({
      id: 'LATEST_DESC',
      sortType: 'LATEST',
      sortOrder: 'DESC',
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('리뷰 정렬 preset을 선택하면 keyword와 rating을 보존해 URL에 반영한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=REVIEW_WHISKEY&keyword=peaty&rating=4.5'),
    );
    const { result } = renderHook(() =>
      useExploreSort({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    act(() => result.current.selectSort('RATING_ASC'));

    const params = parseReplacedQuery(mockReplace);
    expect(params.get('sortType')).toBe('RATING');
    expect(params.get('sortOrder')).toBe('ASC');
    expect(params.get('keyword')).toBe('peaty');
    expect(params.get('rating')).toBe('4.5');
  });

  it('기본 preset을 선택하면 sortType과 sortOrder를 URL에서 생략한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=REVIEW_WHISKEY&keyword=peaty&sortType=RATING&sortOrder=ASC',
      ),
    );
    const { result } = renderHook(() =>
      useExploreSort({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    act(() => result.current.selectSort('LATEST_DESC'));

    const params = parseReplacedQuery(mockReplace);
    expect(params.has('sortType')).toBe(false);
    expect(params.has('sortOrder')).toBe(false);
    expect(params.get('keyword')).toBe('peaty');
  });

  it('이미 선택된 preset을 다시 선택하면 URL과 목록 조건을 변경하지 않는다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('tab=REVIEW_WHISKEY&sortType=RATING&sortOrder=ASC'),
    );
    const { result } = renderHook(() =>
      useExploreSort({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    act(() => result.current.selectSort('RATING_ASC'));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('지원하지 않는 URL 정렬값은 기본값으로 복구하고 파라미터를 제거한다', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=REVIEW_WHISKEY&keyword=peaty&sortType=RANDOM&sortOrder=ASC',
      ),
    );
    const { result } = renderHook(() =>
      useExploreSort({ tabId: REVIEW_EXPLORE_TAB_ID }),
    );

    expect(result.current.selectedSort.id).toBe('LATEST_DESC');
    const params = parseReplacedQuery(mockReplace);
    expect(params.has('sortType')).toBe(false);
    expect(params.has('sortOrder')).toBe(false);
    expect(params.get('keyword')).toBe('peaty');
  });
});
