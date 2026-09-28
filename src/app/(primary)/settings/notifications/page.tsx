import type { Metadata } from 'next';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { NotificationSettings } from './_components/NotificationSettings';

export const metadata: Metadata = {
  title: '알림 수신 설정',
  description: '알림함에 담을 소식을 선택합니다.',
};

export default function NotificationSettingsPage() {
  return (
    <main className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <LegalPageHeader title="알림 수신 설정" />
      <NotificationSettings />
    </main>
  );
}
