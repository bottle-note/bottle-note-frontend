import { ApiResponse } from '@/types/common';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
          return lastPage.meta.pageable.currentCursor + 10;
        }
        return null;
      },
      initialPageParam: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

  const handleFetchNextPage = async () => {
    const data = (await fetchNextPage()).data;
    console.log(data);
  };

  return {
    data: data?.pages,
    error,
    isLoading,
    fetchNextPage: handleFetchNextPage,
    hasNextPage,
  };
};
