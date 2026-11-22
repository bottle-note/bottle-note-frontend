import { Metadata } from 'next';
import NavLayout from '@/components/ui/Layout/NavLayout';

// 검색어 입력 화면만 남아 있다. 히스토리·마이보틀 검색바가 returnUrl과 함께 진입한다.
export const metadata: Metadata = {
  title: '위스키 검색',
  robots: { index: false, follow: true },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavLayout showNavbar={false}>{children}</NavLayout>;
}
