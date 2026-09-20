import type { Metadata } from 'next';
import { ImportClearanceNavLayout } from './_components/ImportClearanceNavLayout';

export const metadata: Metadata = {
  title: '수입통관',
  description: '위스키 수입통관 내역을 확인하세요.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImportClearanceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ImportClearanceNavLayout>{children}</ImportClearanceNavLayout>;
}
