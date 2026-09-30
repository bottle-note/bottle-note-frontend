'use client';

import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { isDevelopmentDeployment } from '@/lib/environment';
import { useNotificationStream } from './useNotificationStream';

export function NotificationRealtimeBridge() {
  const { user, isLoggedIn } = useAuthSession();
  const userId =
    isDevelopmentDeployment() && isLoggedIn ? user?.userId ?? null : null;
  useNotificationStream(userId);
  return null;
}
