import type { Metadata } from 'next';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import { AgreementScreen } from './_components/AgreementScreen';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '서비스 이용 동의',
  description: '보틀노트 서비스 이용을 위한 약관 동의',
};

export default async function AgreementsPage() {
  const [terms, privacyCollectionUse, marketing] = await Promise.all([
    getLegalDocument('terms'),
    getLegalDocument('privacy-collection-use'),
    getLegalDocument('marketing-consent'),
  ]);

  return (
    <AgreementScreen
      documentContents={{
        TERMS_OF_SERVICE: terms.content,
        PRIVACY_COLLECTION_USE: privacyCollectionUse.content,
        MARKETING: marketing.content,
      }}
    />
  );
}
