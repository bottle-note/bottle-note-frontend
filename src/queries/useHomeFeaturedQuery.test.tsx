import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useHomeFeaturedQuery } from './useHomeFeaturedQuery';

jest.mock('@/api/alcohol/alcohol.api', () => ({
  AlcoholsApi: {
    getHistory: jest.fn(),
    getWeeklyPopular: jest.fn(),
    getWeeklyViewPopular: jest.fn(),
    getSpringPopular: jest.fn(),
  },
}));

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));

const mockUseAuthSession = useAuthSession as jest.MockedFunction<
  typeof useAuthSession
>;
const mockGetHistory = AlcoholsApi.getHistory as jest.MockedFunction<
  typeof AlcoholsApi.getHistory
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useHomeFeaturedQuery recent auth guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('비로그인 상태에서는 최근 본 API를 호출하지 않는다', async () => {
    mockUseAuthSession.mockReturnValue({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      logout: jest.fn(),
      session: null,
      refreshSession: jest.fn(),
    });

    const { result } = renderHook(
      () => useHomeFeaturedQuery({ type: 'recent' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockGetHistory).not.toHaveBeenCalled();
  });

  it('로그인 계정별 query로 size 6의 최근 본 목록을 요청한다', async () => {
    mockGetHistory.mockResolvedValue({
      success: true,
      code: 200,
      data: { items: [] },
      errors: [],
      meta: {
        serverEncoding: 'UTF-8',
        serverVersion: '1',
        serverPathVersion: '1',
        serverResponseTime: '0',
        pagination: { hasNext: false, nextCursor: null },
      },
    });
    mockUseAuthSession.mockReturnValue({
      user: { userId: 1 } as never,
      isLoggedIn: true,
      isLoading: false,
      logout: jest.fn(),
      session: null,
      refreshSession: jest.fn(),
    });

    const { rerender } = renderHook(
      () => useHomeFeaturedQuery({ type: 'recent' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledTimes(1));
    expect(mockGetHistory).toHaveBeenLastCalledWith({ size: 6 });

    mockUseAuthSession.mockReturnValue({
      user: { userId: 2 } as never,
      isLoggedIn: true,
      isLoading: false,
      logout: jest.fn(),
      session: null,
      refreshSession: jest.fn(),
    });
    rerender();

    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledTimes(2));
  });
});
