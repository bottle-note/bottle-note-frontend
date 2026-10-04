import { useQuery } from '@tanstack/react-query';
import { NotificationInboxApi } from '@/api/notification/notification.api';
import type { NotificationListData } from '@/api/notification/types';
import { usePaginatedQuery } from './usePaginatedQuery';

export const notificationListKeyPrefix = ['notifications', 'list'] as const;
export const notificationListKey = (userId: number | null) =>
  [...notificationListKeyPrefix, userId] as const;

export const notificationUnreadCountKeyPrefix = [
  'notifications',
  'unread-count',
] as const;
export const notificationUnreadCountKey = (userId: number | null) =>
  [...notificationUnreadCountKeyPrefix, userId] as const;

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
    refetchOnWindowFocus: false,
  });
}
