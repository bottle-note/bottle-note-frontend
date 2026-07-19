import {
  keepPreviousData as preservePreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query';
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
  keepPreviousData?: boolean;
}

export const getNextPageParam = <T>(lastPage: ApiResponse<T>) => {
  const pageable = lastPage.meta.pageable;

  if (!pageable?.hasNext) return undefined;

  return pageable.cursor;
};

export const usePaginatedQuery = <T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchOnMount = true,
  staleTime = 0,
  gcTime = 1000 * 60 * 10,
  intersectionOptions = DEFAULT_INTERSECTION_OPTIONS,
  intersectionThrottleMs,
  keepPreviousData = false,
}: Props<T>) => {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam: 0,
    refetchOnMount,
    refetchOnWindowFocus: false,
    gcTime,
    staleTime,
    enabled,
    retry: false,
    placeholderData: keepPreviousData ? preservePreviousData : undefined,
  });

  const { targetRef } = useInfiniteScroll({
    fetchNextPage: () => {
      if (!isFetching && !isPlaceholderData && hasNextPage) {
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
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
    targetRef,
    refetch,
  };
};
