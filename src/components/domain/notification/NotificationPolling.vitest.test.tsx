import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  notificationListKey,
  notificationUnreadCountKey,
} from '@/queries/useNotificationsQuery';
import { useNotificationPolling } from './useNotificationPolling';

const getList = vi.fn(async () => ({ items: [] }));
const getUnreadCount = vi.fn(async () => ({ unreadCount: 0 }));

function NotificationQueries({ userId }: { userId: number | null }) {
  useNotificationPolling(userId !== null);
  useQuery({
    queryKey: notificationListKey(userId),
    queryFn: getList,
    enabled: userId !== null,
  });
  useQuery({
    queryKey: notificationUnreadCountKey(userId),
    queryFn: getUnreadCount,
    enabled: userId !== null,
  });
  return null;
}

describe('알림 폴링', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('로그인 중 보이는 탭에서 1분마다 목록과 미읽음 수를 갱신하고 로그아웃하면 멈춘다', async () => {
    vi.useFakeTimers();
    let visibility: DocumentVisibilityState = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibility,
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const { rerender, unmount } = render(
      <QueryClientProvider client={client}>
        <NotificationQueries userId={7} />
      </QueryClientProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(getList).toHaveBeenCalledTimes(1);
    expect(getUnreadCount).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
    });
    expect(getList).toHaveBeenCalledTimes(2);
    expect(getUnreadCount).toHaveBeenCalledTimes(2);

    visibility = 'hidden';
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await act(async () => {
      vi.advanceTimersByTime(120_000);
      await Promise.resolve();
    });
    expect(getList).toHaveBeenCalledTimes(2);
    expect(getUnreadCount).toHaveBeenCalledTimes(2);

    visibility = 'visible';
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(getList).toHaveBeenCalledTimes(3);
    expect(getUnreadCount).toHaveBeenCalledTimes(3);

    rerender(
      <QueryClientProvider client={client}>
        <NotificationQueries userId={null} />
      </QueryClientProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
    });
    expect(getList).toHaveBeenCalledTimes(3);
    expect(getUnreadCount).toHaveBeenCalledTimes(3);

    unmount();
    client.clear();
  });
});
