import { useInfiniteQuery } from '@tanstack/react-query';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiResponse } from '@/api/_shared/types';

const DEFAULT_INTERSECTION_OPTIONS: IntersectionObserverInit = {
  rootMargin: '800px',
  threshold: 0,
};

interface Props<T> {
  queryKey: [string, ...Array<any>];
  queryFn: (params: any) => Promise<ApiResponse<T>>;
  pageSize?: number;
  staleTime?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  gcTime?: number;
  intersectionOptions?: IntersectionObserverInit;
  intersectionThrottleMs?: number;
}

export const usePaginatedQuery = <T>({
  queryKey,
  queryFn,
  pageSize = 10,
  enabled = true,
  refetchOnMount = true,
  staleTime = 0,
  gcTime = 1000 * 60 * 10,
  intersectionOptions = DEFAULT_INTERSECTION_OPTIONS,
  intersectionThrottleMs,
}: Props<T>) => {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage: ApiResponse<T>) => {
      if (lastPage.meta.pageable?.hasNext) {
        return lastPage.meta.pageable.currentCursor + pageSize;
      }
      return null;
    },
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    gcTime,
    staleTime,
    enabled,
    retry: false,
  });

  const { targetRef } = useInfiniteScroll({
    fetchNextPage: () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    options: intersectionOptions,
    throttleMs: intersectionThrottleMs,
  });

  return {
    data: data?.pages,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    targetRef,
    refetch,
  };
};
