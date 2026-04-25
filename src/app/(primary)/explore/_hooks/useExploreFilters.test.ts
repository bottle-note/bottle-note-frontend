import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook, act } from '@testing-library/react';
import { useExploreFilters } from './useExploreFilters';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const PATHNAME = '/explore';

const setupSearchParams = (query: string) => {
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
};

/**
 * router.replace에 전달된 URL의 쿼리 부분을 파싱해 비교하기 위한 헬퍼.
 * URLSearchParams 직렬화 결과는 결정적이지만, 테스트 가독성을 위해
 * pairs 비교로 통일한다.
 */
const parseReplacedQuery = (mockReplace: jest.Mock): URLSearchParams => {
  const [url] = mockReplace.mock.calls[0];
  const queryStart = url.indexOf('?');
  return new URLSearchParams(queryStart >= 0 ? url.slice(queryStart + 1) : '');
};

describe('useExploreFilters 훅', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (usePathname as jest.Mock).mockReturnValue(PATHNAME);
  });

  describe('URL 읽기', () => {
    it('A1: regionIds 다중 값을 number 배열로 반환한다', () => {
      setupSearchParams('regionIds=12&regionIds=34');

      const { result } = renderHook(() => useExploreFilters());

      expect(result.current.regionIds).toEqual([12, 34]);
      expect(result.current.category).toBe('');
    });

    it('A2: category 단일 값을 문자열로 반환한다', () => {
      setupSearchParams('category=SINGLE_MALT');

      const { result } = renderHook(() => useExploreFilters());

      expect(result.current.regionIds).toEqual([]);
      expect(result.current.category).toBe('SINGLE_MALT');
    });

    it('A3: 빈 URL이면 빈 배열과 빈 문자열을 반환한다', () => {
      setupSearchParams('');

      const { result } = renderHook(() => useExploreFilters());

      expect(result.current.regionIds).toEqual([]);
      expect(result.current.category).toBe('');
    });

    it('A4: regionIds 중 NaN(숫자 변환 실패)은 걸러낸다', () => {
      setupSearchParams('regionIds=abc&regionIds=12');

      const { result } = renderHook(() => useExploreFilters());

      expect(result.current.regionIds).toEqual([12]);
    });

    it('A6: keywords/tab 등 다른 파라미터는 무시하고 regionIds/category만 읽는다', () => {
      setupSearchParams(
        'regionIds=12&category=BOURBON&keywords=peaty&tab=EXPLORER_WHISKEY',
      );

      const { result } = renderHook(() => useExploreFilters());

      expect(result.current.regionIds).toEqual([12]);
      expect(result.current.category).toBe('BOURBON');
    });
  });

  describe('toggleRegionId', () => {
    it('B1: 빈 URL에서 regionId 추가 시 regionIds 파라미터를 만든다', () => {
      setupSearchParams('');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleRegionId(12));

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.getAll('regionIds')).toEqual(['12']);
    });

    it('B2: 기존 regionIds에 새 값을 추가하면 배열 끝에 붙인다', () => {
      setupSearchParams('regionIds=12');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleRegionId(34));

      expect(parseReplacedQuery(mockReplace).getAll('regionIds')).toEqual([
        '12',
        '34',
      ]);
    });

    it('B3: 이미 선택된 regionId를 다시 토글하면 해당 값만 제거한다', () => {
      setupSearchParams('regionIds=12&regionIds=34');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleRegionId(12));

      expect(parseReplacedQuery(mockReplace).getAll('regionIds')).toEqual([
        '34',
      ]);
    });

    it('B4: keywords/tab 등 다른 파라미터를 보존한다', () => {
      setupSearchParams('keywords=foo&tab=EXPLORER_WHISKEY');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleRegionId(12));

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.get('keywords')).toBe('foo');
      expect(replaced.get('tab')).toBe('EXPLORER_WHISKEY');
      expect(replaced.getAll('regionIds')).toEqual(['12']);
    });

    it('B5: category가 있어도 보존하면서 regionIds를 추가한다', () => {
      setupSearchParams('regionIds=12&category=SINGLE_MALT');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleRegionId(34));

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.get('category')).toBe('SINGLE_MALT');
      expect(replaced.getAll('regionIds')).toEqual(['12', '34']);
    });
  });

  describe('clearRegionIds', () => {
    it('C1: regionIds만 제거하고 다른 파라미터는 유지한다', () => {
      setupSearchParams('regionIds=12&regionIds=34&keywords=foo');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.clearRegionIds());

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.getAll('regionIds')).toEqual([]);
      expect(replaced.get('keywords')).toBe('foo');
    });

    it('C2: regionIds가 원래 없으면 router.replace를 호출하지 않는다', () => {
      setupSearchParams('keywords=foo');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.clearRegionIds());

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('toggleCategory', () => {
    it('D1: 빈 URL에서 카테고리 선택 시 category 파라미터를 만든다', () => {
      setupSearchParams('');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleCategory('SINGLE_MALT'));

      expect(parseReplacedQuery(mockReplace).get('category')).toBe(
        'SINGLE_MALT',
      );
    });

    it('D2: 같은 값을 재토글하면 category를 해제한다', () => {
      setupSearchParams('category=SINGLE_MALT');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleCategory('SINGLE_MALT'));

      expect(parseReplacedQuery(mockReplace).has('category')).toBe(false);
    });

    it('D3: 다른 값으로 토글하면 category를 교체한다', () => {
      setupSearchParams('category=SINGLE_MALT');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleCategory('BLENDED'));

      expect(parseReplacedQuery(mockReplace).get('category')).toBe('BLENDED');
    });

    it('D4: regionIds/keywords 등 다른 파라미터를 보존한다', () => {
      setupSearchParams('regionIds=12&keywords=foo');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.toggleCategory('BOURBON'));

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.get('category')).toBe('BOURBON');
      expect(replaced.getAll('regionIds')).toEqual(['12']);
      expect(replaced.get('keywords')).toBe('foo');
    });
  });

  describe('clearCategory', () => {
    it('E1: category만 제거하고 다른 파라미터는 유지한다', () => {
      setupSearchParams('category=SINGLE_MALT&regionIds=12');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.clearCategory());

      const replaced = parseReplacedQuery(mockReplace);
      expect(replaced.has('category')).toBe(false);
      expect(replaced.getAll('regionIds')).toEqual(['12']);
    });

    it('E2: category가 원래 없으면 router.replace를 호출하지 않는다', () => {
      setupSearchParams('regionIds=12');

      const { result } = renderHook(() => useExploreFilters());

      act(() => result.current.clearCategory());

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
