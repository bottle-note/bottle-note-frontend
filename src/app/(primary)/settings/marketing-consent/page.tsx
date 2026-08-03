import type { Metadata } from 'next';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import { MarketingConsentSettings } from './_components/MarketingConsentSettings';

export const metadata: Metadata = {
  title: '마케팅 정보 수신 동의 관리',
  description: '마케팅 정보 수신 동의 상태를 확인하고 변경합니다.',
};

export default async function MarketingConsentSettingsPage() {
  const document = await getLegalDocument('marketing-consent');

  return (
    <main className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <LegalPageHeader title="마케팅 정보 수신 동의" />
      <MarketingConsentSettings documentContent={document.content} />
    </main>
  );
}
