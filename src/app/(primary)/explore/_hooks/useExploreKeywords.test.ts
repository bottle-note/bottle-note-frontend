import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook, act } from '@testing-library/react';
import { useExploreKeywords } from './useExploreKeywords';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const PATHNAME = '/explore';
const TAB_ID = 'EXPLORER_WHISKEY';

const setupSearchParams = (query: string) => {
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
};

/**
 * 마운트 시점의 URL 동기화 effect로 인한 router.replace 호출이 끝난 뒤
 * 반환되는 mock으로 회귀 검증을 단순화한다.
 */
const findReplaceCallWithKeyword = (
  mockReplace: jest.Mock,
  predicate: (params: URLSearchParams) => boolean,
): URLSearchParams | undefined => {
  for (const [url] of mockReplace.mock.calls) {
    const queryStart = url.indexOf('?');
    const params = new URLSearchParams(
      queryStart >= 0 ? url.slice(queryStart + 1) : '',
    );
    if (predicate(params)) {
      return params;
    }
  }
  return undefined;
};

describe('useExploreKeywords 훅 - 다른 필터 파라미터 보존 (회귀 방어)', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (usePathname as jest.Mock).mockReturnValue(PATHNAME);
  });

  it('K1: 키워드 추가 시 regionIds/category/tab을 모두 보존한다', () => {
    setupSearchParams('tab=EXPLORER_WHISKEY&regionIds=12&category=BOURBON');

    const { result } = renderHook(() => useExploreKeywords({ tabId: TAB_ID }));

    act(() => {
      result.current.handleAddKeyword({ label: 'peaty', value: 'peaty' });
    });

    const replaced = findReplaceCallWithKeyword(mockReplace, (params) =>
      params.getAll('keywords').includes('peaty'),
    );

    expect(replaced).toBeDefined();
    expect(replaced!.get('tab')).toBe('EXPLORER_WHISKEY');
    expect(replaced!.getAll('regionIds')).toEqual(['12']);
    expect(replaced!.get('category')).toBe('BOURBON');
    expect(replaced!.getAll('keywords')).toEqual(['peaty']);
  });

  it('K2: 키워드 제거 시 regionIds 등 다른 파라미터는 유지한다', () => {
    setupSearchParams(
      'tab=EXPLORER_WHISKEY&regionIds=12&keywords=foo&keywords=bar',
    );

    const { result } = renderHook(() => useExploreKeywords({ tabId: TAB_ID }));

    act(() => {
      result.current.handleRemoveKeyword('foo');
    });

    const replaced = findReplaceCallWithKeyword(
      mockReplace,
      (params) =>
        params.getAll('keywords').length === 1 &&
        params.getAll('keywords')[0] === 'bar',
    );

    expect(replaced).toBeDefined();
    expect(replaced!.getAll('regionIds')).toEqual(['12']);
    expect(replaced!.get('tab')).toBe('EXPLORER_WHISKEY');
    expect(replaced!.getAll('keywords')).toEqual(['bar']);
  });
});
