// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook } from '@testing-library/react';
import {
  keepPreviousData as preservePreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { usePaginatedQuery } from './usePaginatedQuery';

jest.mock('@tanstack/react-query', () => ({
  keepPreviousData: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

jest.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: jest.fn(),
}));

const mockUseInfiniteQuery = useInfiniteQuery as jest.Mock;
const mockUseInfiniteScroll = useInfiniteScroll as jest.Mock;

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

  it('옵션 활성화 시 이전 페이지를 placeholder로 유지한다', () => {
    mockUseInfiniteQuery.mockReturnValue(createQueryResult());

    renderHook(() =>
      usePaginatedQuery({
        queryKey: ['explore.alcohols', 'macallan'],
        queryFn: jest.fn(),
        keepPreviousData: true,
      }),
    );

    expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({ placeholderData: preservePreviousData }),
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
        keepPreviousData: true,
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
        keepPreviousData: true,
      }),
    );

    const [{ fetchNextPage: handleIntersection }] =
      mockUseInfiniteScroll.mock.calls[0];
    handleIntersection();

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
