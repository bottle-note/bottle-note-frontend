import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiResponse } from '@/types/common';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Props<T> {
  queryKey: [string, any];
  queryFn: (params: any) => Promise<ApiResponse<T>>;
  pageSize?: number;
}

export const usePaginatedQuery = <T>({
  queryKey,
  queryFn,
  pageSize = 10,
}: Props<T>) => {
  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey,
      queryFn,
      getNextPageParam: (lastPage: ApiResponse<T>) => {
        if (lastPage.meta.pageable?.hasNext) {
          return lastPage.meta.pageable.currentCursor + pageSize;
        }
        return null;
      },
      initialPageParam: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
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
  };
};