import { useQuery } from '@tanstack/react-query';
import { NotificationSettingsApi } from '@/api/notification/notification.api';

export const NOTIFICATION_SETTINGS_KEY = ['notifications', 'settings'] as const;

export function useNotificationSettingsQuery(enabled: boolean) {
  return useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: NotificationSettingsApi.getSettings,
    enabled,
    retry: false,
  });
}
