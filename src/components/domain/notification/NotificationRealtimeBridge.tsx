'use client';

import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNotificationStream } from './useNotificationStream';

export function NotificationRealtimeBridge() {
  const { user, isLoggedIn } = useAuthSession();
  const userId =
    process.env.NEXT_PUBLIC_DEPLOY_ENV === 'development' && isLoggedIn
      ? user?.userId ?? null
      : null;
  useNotificationStream(userId);
  return null;
}
