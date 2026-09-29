import type { Metadata } from 'next';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { NotificationSettings } from './_components/NotificationSettings';
import { notificationSettingsCopy as copy } from './_components/notificationSettingsCopy';

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
};

export default function NotificationSettingsPage() {
  return (
    <main className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <LegalPageHeader title={copy.title} />
      <NotificationSettings />
    </main>
  );
}
