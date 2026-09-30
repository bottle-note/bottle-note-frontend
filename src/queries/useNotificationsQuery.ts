import { useQuery } from '@tanstack/react-query';
import { NotificationInboxApi } from '@/api/notification/notification.api';
import type { NotificationListData } from '@/api/notification/types';
import { usePaginatedQuery } from './usePaginatedQuery';

export const notificationListKey = (userId: number | null) =>
  ['notifications', 'list', userId] as const;

export const notificationUnreadCountKey = (userId: number | null) =>
  ['notifications', 'unread-count', userId] as const;

export function useNotificationsQuery(userId: number | null) {
  return usePaginatedQuery<NotificationListData>({
    queryKey: notificationListKey(userId),
    queryFn: ({ pageParam }) => NotificationInboxApi.getList(pageParam),
    enabled: userId !== null,
  });
}

export function useNotificationUnreadCount(userId: number | null) {
  return useQuery({
    queryKey: notificationUnreadCountKey(userId),
    queryFn: NotificationInboxApi.getUnreadCount,
    enabled: userId !== null,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible'
        ? 60_000
        : false,
  });
}
