import { useQuery } from '@tanstack/react-query';
import { NotificationSettingsApi } from '@/api/notification/notification.api';

export const NOTIFICATION_SETTINGS_KEY = ['notifications', 'settings'] as const;

export const notificationSettingsKey = (userId: number) =>
  [...NOTIFICATION_SETTINGS_KEY, userId] as const;

export function useNotificationSettingsQuery(userId: number | null) {
  return useQuery({
    queryKey: [...NOTIFICATION_SETTINGS_KEY, userId],
    queryFn: NotificationSettingsApi.getSettings,
    enabled: userId !== null,
    retry: false,
  });
}
