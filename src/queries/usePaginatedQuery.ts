import { useEffect, useRef } from 'react';
import {
  hashKey,
  type QueryFunctionContext,
  type QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiResponse } from '@/api/_shared/types';
import { ApiError } from '@/utils/ApiError';

const DEFAULT_INTERSECTION_OPTIONS: IntersectionObserverInit = {
  rootMargin: '800px',
  threshold: 0,
};

interface Props<T> {
  queryKey: QueryKey;
  queryFn: (
    context: QueryFunctionContext<QueryKey, string | undefined>,
  ) => Promise<ApiResponse<T>>;
  staleTime?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
  gcTime?: number;
  intersectionOptions?: IntersectionObserverInit;
  intersectionThrottleMs?: number;
}

const isCursorExpiredError = (error: unknown) =>
  error instanceof ApiError &&
  error.response.status === 410 &&
  error.code === 'CURSOR_EXPIRED';

export const getNextPageParam = <T>(lastPage: ApiResponse<T>) => {
  const pagination = lastPage.meta.pagination;

  if (!pagination?.hasNext || !pagination.nextCursor) return undefined;

  return pagination.nextCursor;
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
}: Props<T>) => {
  const queryClient = useQueryClient();
  const queryHash = hashKey(queryKey);
  const restartGuardRef = useRef({ queryHash, used: false });
  const failedPageParamRef = useRef<string | undefined>(undefined);

  if (restartGuardRef.current.queryHash !== queryHash) {
    restartGuardRef.current = { queryHash, used: false };
    failedPageParamRef.current = undefined;
  }

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
    queryFn: async (context) => {
      failedPageParamRef.current = context.pageParam;
      return queryFn(context);
    },
    getNextPageParam,
    initialPageParam: undefined as string | undefined,
    refetchOnMount,
    refetchOnWindowFocus: false,
    gcTime,
    staleTime,
    enabled,
    retry: false,
    placeholderData: undefined,
  });

  useEffect(() => {
    if (
      !isCursorExpiredError(error) ||
      failedPageParamRef.current === undefined ||
      restartGuardRef.current.used
    ) {
      return;
    }

    restartGuardRef.current.used = true;
    void queryClient.resetQueries({ queryKey, exact: true });
  }, [error, queryClient, queryKey, queryHash]);

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
