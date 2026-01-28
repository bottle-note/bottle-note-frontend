import type { Metadata } from 'next';

import TarotLayoutClient from './_components/TarotLayoutClient';
import '@/style/globals.css';

const BASE_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL || 'https://bottle-note.com';

export const metadata: Metadata = {
  title: '나의 2026 위스키 운세 | 위스키 타로',
  description:
    '타로 카드로 알아보는 나에게 어울리는 위스키. 새해 운세와 함께 당신만의 위스키를 추천받아 보세요.',
  keywords: ['위스키', '타로', '운세', '위스키 추천', '2026', '새해 운세'],
  openGraph: {
    title: '나의 2026 위스키 운세',
    description: '타로 카드로 알아보는 나에게 어울리는 위스키',
    url: `${BASE_URL}/whiskey-tarot`,
    siteName: 'Bottle Note',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '나의 2026 위스키 운세',
    description: '타로 카드로 알아보는 나에게 어울리는 위스키',
  },
};

export default function WhiskeyTarotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TarotLayoutClient>{children}</TarotLayoutClient>;
}
