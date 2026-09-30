import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isDevelopmentDeployment } from '@/lib/environment';
import { NotificationInbox } from './_components/NotificationInbox';

export const metadata: Metadata = { title: '알림' };

export default function NotificationsPage() {
  if (!isDevelopmentDeployment()) notFound();

  return <NotificationInbox />;
}
