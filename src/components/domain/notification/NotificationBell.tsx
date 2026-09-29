'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNotificationUnreadCount } from '@/queries/useNotificationsQuery';

export function NotificationBell() {
  const { user, isLoggedIn } = useAuthSession();
  const enabled = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'development';
  const userId = enabled && isLoggedIn ? user?.userId ?? null : null;
  const { data } = useNotificationUnreadCount(userId);

  if (userId === null) return null;

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Link
      href={ROUTES.NOTIFICATIONS}
      aria-label={
        unreadCount > 0 ? `알림함, 읽지 않은 알림 ${unreadCount}개` : '알림함'
      }
      className="relative flex h-40 w-28 items-center justify-center text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
    >
      <Bell size={23} strokeWidth={1.8} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -right-4 top-0 flex min-w-17 h-17 items-center justify-center rounded-full border-2 border-bg-layer-default bg-bg-brand-solid px-2 text-10 font-bold leading-none text-palette-static-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
