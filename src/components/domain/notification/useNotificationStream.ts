import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  notificationListKey,
  notificationUnreadCountKey,
} from '@/queries/useNotificationsQuery';
import { subscribeToNotificationEvents } from './notificationStream';

export function useNotificationStream(userId: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userId === null) return undefined;

    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationListKey(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationUnreadCountKey(userId),
      });
    };

    return subscribeToNotificationEvents({
      onConnected: refresh,
      onNotification: refresh,
    });
  }, [queryClient, userId]);
}
