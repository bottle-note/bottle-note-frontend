import type { Metadata } from 'next';
import { LegalDocumentRenderer } from '@/components/feature/legal/LegalDocumentRenderer';
import { LegalPageHeader } from '@/components/feature/legal/LegalPageHeader';
import { getLegalDocument } from '@/lib/legal/legalDocuments';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '이용약관',
  description: '보틀노트 서비스 이용약관',
};

export default async function TermsPage() {
  const document = await getLegalDocument('terms');

  return (
    <div className="content-container min-h-safe-screen bg-white">
      <LegalPageHeader title="이용약관" />
      <LegalDocumentRenderer document={document} />
    </div>
  );
}
