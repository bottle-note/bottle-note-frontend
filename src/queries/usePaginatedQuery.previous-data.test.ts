// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook } from '@testing-library/react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiError } from '@/utils/ApiError';
import { usePaginatedQuery } from './usePaginatedQuery';

jest.mock('@tanstack/react-query', () => ({
  hashKey: jest.fn(() => 'test-query'),
  useInfiniteQuery: jest.fn(),
  useQueryClient: jest.fn(() => ({ resetQueries: jest.fn() })),
}));

jest.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: jest.fn(),
}));

const mockUseInfiniteQuery = useInfiniteQuery as jest.Mock;
const mockUseInfiniteScroll = useInfiniteScroll as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

const createQueryResult = (overrides = {}) => ({
  data: { pages: [] },
  error: null,
  isLoading: false,
  fetchNextPage: jest.fn(),
  hasNextPage: true,
  isFetching: false,
  isFetchingNextPage: false,
  isPlaceholderData: false,
  refetch: jest.fn(),
  ...overrides,
});

describe('usePaginatedQuery previous data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInfiniteScroll.mockReturnValue({ targetRef: { current: null } });
  });

  it('query context 변경 시 이전 페이지를 placeholder로 유지하지 않는다', () => {
    mockUseInfiniteQuery.mockReturnValue(createQueryResult());

    const { rerender } = renderHook(
      ({ keyword }) =>
        usePaginatedQuery({
          queryKey: ['explore.alcohols', keyword],
          queryFn: jest.fn(),
        }),
      { initialProps: { keyword: 'macallan' } },
    );

    rerender({ keyword: 'lagavulin' });

    expect(mockUseInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryKey: ['explore.alcohols', 'lagavulin'],
        placeholderData: undefined,
      }),
    );
  });

  it('placeholder 또는 첫 페이지 fetch 중에는 next page를 요청하지 않는다', () => {
    const fetchNextPage = jest.fn();
    mockUseInfiniteQuery.mockReturnValue(
      createQueryResult({
        fetchNextPage,
        isFetching: true,
        isPlaceholderData: true,
      }),
    );

    renderHook(() =>
      usePaginatedQuery({
        queryKey: ['explore.alcohols', 'macallan'],
        queryFn: jest.fn(),
      }),
    );

    const [{ fetchNextPage: handleIntersection }] =
      mockUseInfiniteScroll.mock.calls[0];
    handleIntersection();

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('현재 query가 안정화된 뒤에만 next page를 요청한다', () => {
    const fetchNextPage = jest.fn();
    mockUseInfiniteQuery.mockReturnValue(createQueryResult({ fetchNextPage }));

    renderHook(() =>
      usePaginatedQuery({
        queryKey: ['explore.alcohols', 'macallan'],
        queryFn: jest.fn(),
      }),
    );

    const [{ fetchNextPage: handleIntersection }] =
      mockUseInfiniteScroll.mock.calls[0];
    handleIntersection();

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('첫 요청 pageParam을 undefined로 두고 CURSOR_EXPIRED next page를 정확히 한 번 reset한다', async () => {
    const resetQueries = jest.fn();
    const cursorExpired = new ApiError(
      'expired',
      { status: 410 } as Response,
      'CURSOR_EXPIRED',
    );
    const queryFn = jest.fn().mockRejectedValue(cursorExpired);

    mockUseQueryClient.mockReturnValue({ resetQueries });
    mockUseInfiniteQuery.mockReturnValue(createQueryResult());

    const { result, rerender } = renderHook(() =>
      usePaginatedQuery({
        queryKey: ['explore.alcohols', 'macallan'],
        queryFn,
      }),
    );

    const options = mockUseInfiniteQuery.mock.calls[0][0];
    expect(options.initialPageParam).toBeUndefined();

    await expect(options.queryFn({ pageParam: 'opaque-cursor' })).rejects.toBe(
      cursorExpired,
    );

    mockUseInfiniteQuery.mockReturnValue(
      createQueryResult({ error: cursorExpired }),
    );
    rerender();

    expect(resetQueries).toHaveBeenCalledWith({
      queryKey: ['explore.alcohols', 'macallan'],
      exact: true,
    });

    rerender();
    expect(resetQueries).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(cursorExpired);
  });

  it.each([
    { response: { status: 400 } as Response, code: 'INVALID_CURSOR' },
    { response: { status: 400 } as Response, code: 'CURSOR_CONTEXT_MISMATCH' },
    { response: { status: 410 } as Response, code: 'OTHER_410' },
  ])(
    'invalid/context mismatch/other 410은 자동 restart하지 않는다',
    async (error) => {
      const resetQueries = jest.fn();
      const queryFn = jest
        .fn()
        .mockRejectedValue(new ApiError('cursor', error.response, error.code));

      mockUseQueryClient.mockReturnValue({ resetQueries });
      mockUseInfiniteQuery.mockReturnValue(createQueryResult());

      const { rerender } = renderHook(() =>
        usePaginatedQuery({
          queryKey: ['explore.alcohols', 'macallan'],
          queryFn,
        }),
      );
      const options = mockUseInfiniteQuery.mock.calls[0][0];
      const rejectedError = await options
        .queryFn({ pageParam: 'opaque-cursor' })
        .catch((caught: unknown) => caught);

      mockUseInfiniteQuery.mockReturnValue(
        createQueryResult({ error: rejectedError }),
      );
      rerender();

      expect(resetQueries).not.toHaveBeenCalled();
    },
  );
});
