import type { Metadata } from 'next';
import { LegalDocumentRenderer } from '@/components/feature/legal/LegalDocumentRenderer';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { getLegalDocument } from '@/lib/legal/legalDocuments';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '마케팅 활용 및 광고성 정보 수신 동의',
  description: '보틀노트 마케팅 활용 및 광고성 정보 수신 동의',
};

export default async function MarketingConsentPage() {
  const document = await getLegalDocument('marketing-consent');

  return (
    <div className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <LegalPageHeader title="마케팅 정보 수신 동의" />
      <LegalDocumentRenderer document={document} />
    </div>
  );
}
