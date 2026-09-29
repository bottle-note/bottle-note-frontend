import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NotificationInbox } from './_components/NotificationInbox';

export const metadata: Metadata = { title: '알림' };

export default function NotificationsPage() {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'development') notFound();

  return <NotificationInbox />;
}
