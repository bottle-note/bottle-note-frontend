import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  notificationListKeyPrefix,
  notificationUnreadCountKeyPrefix,
} from '@/queries/useNotificationsQuery';

const POLLING_INTERVAL_MS = 60_000;

export function useNotificationPolling(isEnabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isEnabled) return undefined;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationListKeyPrefix,
        refetchType: 'active',
      });
      void queryClient.invalidateQueries({
        queryKey: notificationUnreadCountKeyPrefix,
        refetchType: 'active',
      });
    };

    const schedule = () => {
      clearTimeout(timer);
      if (document.visibilityState !== 'visible') return;
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, POLLING_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
      schedule();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [queryClient, isEnabled]);
}
