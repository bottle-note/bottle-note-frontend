import type { Metadata } from 'next';
import { AgreementScreen } from './_components/AgreementScreen';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '서비스 이용 동의',
  description: '보틀노트 서비스 이용을 위한 약관 동의',
};

export default function AgreementsPage() {
  return <AgreementScreen />;
}
