import { Metadata } from 'next';
import NavLayout from '@/components/ui/Layout/NavLayout';

export const metadata: Metadata = {
  title: '위스키 둘러보기',
  description:
    '다양한 위스키와 인기 리뷰를 둘러보세요. 새로운 위스키를 발견하고 다른 사용자들의 테이스팅 노트를 확인하세요.',
  keywords: [
    '위스키 둘러보기',
    '위스키 추천',
    '인기 위스키',
    '위스키 리뷰',
    '위스키 종류',
    '위스키',
  ],
  openGraph: {
    title: '위스키 둘러보기 | Bottle Note',
    description:
      '다양한 위스키와 인기 리뷰를 둘러보세요. 새로운 위스키를 발견하고 다른 사용자들의 테이스팅 노트를 확인하세요.',
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavLayout showNavbar>{children}</NavLayout>;
}
