import { useInfiniteQuery } from '@tanstack/react-query';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiResponse } from '@/types/common';

interface Props<T> {
  queryKey: [string, ...Array<any>];
  queryFn: (params: any) => Promise<ApiResponse<T>>;
  pageSize?: number;
  // staleTime?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  gcTime?: number;
}

export const usePaginatedQuery = <T>({
  queryKey,
  queryFn,
  pageSize = 10,
  enabled = true,
  refetchOnMount = true,
  gcTime = 0,
}: Props<T>) => {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
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
    enabled,
  });

  const { targetRef } = useInfiniteScroll({
    fetchNextPage,
  });

  return {
    data: data?.pages,
    error,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    targetRef,
    refetch,
  };
};
