import { ApiResponse } from '@/types/common';
import { useInfiniteQuery } from '@tanstack/react-query';

interface Props<T> {
  queryKey: [string, any];
  queryFn: (params: any) => Promise<ApiResponse<T>>;
}

export const usePaginatedQuery = <T>({ queryKey, queryFn }: Props<T>) => {
  const { data, error, isLoading, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn,
      getNextPageParam: (lastPage: ApiResponse<T>) => {
        if (lastPage.meta.pageable?.hasNext) {
          lastPage.meta.pageable.currentCursor + 1;
        }
        return null;
      },
      initialPageParam: 0,
    });

  return {
    data: data?.pages,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
  };
};
