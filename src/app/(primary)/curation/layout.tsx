import { Metadata } from 'next';
import { CurationNavLayout } from './_components/CurationNavLayout';

export const metadata: Metadata = {
  title: '큐레이션',
  description:
    '보틀노트가 추천하는 위스키 큐레이션과 시음회 정보를 확인하세요.',
  keywords: ['큐레이션', '위스키 큐레이션', '위스키 추천', '위스키 시음회'],
  openGraph: {
    title: '큐레이션 | Bottle Note',
    description:
      '보틀노트가 추천하는 위스키 큐레이션과 시음회 정보를 확인하세요.',
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CurationNavLayout>{children}</CurationNavLayout>;
}
