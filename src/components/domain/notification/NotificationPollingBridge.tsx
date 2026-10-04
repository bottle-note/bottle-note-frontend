'use client';

import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { isDevelopmentDeployment } from '@/lib/environment';
import { useNotificationPolling } from './useNotificationPolling';

export function NotificationPollingBridge() {
  const { isLoggedIn } = useAuthSession();
  useNotificationPolling(isDevelopmentDeployment() && isLoggedIn);
  return null;
}
