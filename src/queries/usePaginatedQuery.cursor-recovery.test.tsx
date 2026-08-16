// eslint-disable-next-line import/no-extraneous-dependencies
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  type QueryFunctionContext,
  type QueryKey,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ApiResponse } from '@/api/_shared/types';
import { ApiError } from '@/utils/ApiError';
import { usePaginatedQuery } from './usePaginatedQuery';

jest.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: jest.fn(() => ({ targetRef: { current: null } })),
}));

const createPage = (nextCursor: string): ApiResponse<{ items: number[] }> => ({
  success: true,
  code: 200,
  data: { items: [1] },
  errors: [],
  meta: {
    serverEncoding: 'UTF-8',
    serverVersion: 'test',
    serverPathVersion: 'v1',
    serverResponseTime: '2026-08-16T00:00:00Z',
    pagination: { hasNext: true, nextCursor },
  },
});

describe('usePaginatedQuery CURSOR_EXPIRED recovery', () => {
  it('첫 만료는 cursor 없는 첫 페이지로 재시작하고 두 번째 만료는 error로 남긴다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
      },
    });
    const cursorExpired = new ApiError(
      'expired',
      { status: 410 } as Response,
      'CURSOR_EXPIRED',
    );
    let firstPageCount = 0;
    const queryFn = jest.fn(
      async ({
        pageParam,
      }: QueryFunctionContext<QueryKey, string | undefined>): Promise<
        ApiResponse<{ items: number[] }>
      > => {
        if (pageParam === undefined) {
          firstPageCount += 1;
          return createPage(`expired-cursor-${firstPageCount}`);
        }

        throw cursorExpired;
      },
    );
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        usePaginatedQuery({
          queryKey: ['cursor-recovery'],
          queryFn,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(firstPageCount).toBe(2));
    expect(queryFn.mock.calls.map(([context]) => context.pageParam)).toEqual([
      undefined,
      'expired-cursor-1',
      undefined,
    ]);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.error).toBe(cursorExpired));
    expect(firstPageCount).toBe(2);
    expect(queryFn.mock.calls.map(([context]) => context.pageParam)).toEqual([
      undefined,
      'expired-cursor-1',
      undefined,
      'expired-cursor-2',
    ]);

    queryClient.clear();
  });
});
