import type { Metadata } from 'next';
import { LegalDocumentRenderer } from '@/components/feature/legal/LegalDocumentRenderer';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { getLegalDocument } from '@/lib/legal/legalDocuments';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '개인정보 수집·이용 동의',
  description: '보틀노트 개인정보 수집·이용 동의',
};

export default async function PrivacyCollectionUsePage() {
  const document = await getLegalDocument('privacy-collection-use');

  return (
    <div className="content-container min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <LegalPageHeader title="개인정보 수집·이용 동의" />
      <LegalDocumentRenderer document={document} />
    </div>
  );
}
