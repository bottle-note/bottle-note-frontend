import type { Metadata, Viewport } from 'next';
import '@/style/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Providers } from '@/lib/Providers';
import { BASE_URL } from '@/constants/common';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';

const isProd = process.env.VERCEL_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL(
    isProd ? BASE_URL : 'https://development.bottle-note.com',
  ),
  title: {
    default: '보틀노트(Bottle Note) - 위스키 라이프를 기록하다',
    template: '%s | Bottle Note',
  },
  description:
    '위스키 라이프를 기록하다. 위스키 리뷰, 시음 후기, 평점을 기록하고 공유하세요. 위스키 추천과 테이스팅 노트, 다양한 정보를 보틀노트에서 만나보세요.',
  keywords: [
    '위스키',
    '위스키 리뷰',
    '테이스팅 노트',
    '위스키 평점',
    '보틀노트',
    'Bottle Note',
    '추천 위스키',
    '위스키 후기',
    '싱글몰트 위스키',
    '버번 위스키',
  ],
  authors: [{ name: 'Bottle Note Team' }],
  creator: 'Bottle Note',
  publisher: 'Bottle Note',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'Bottle Note',
    title: '보틀노트(Bottle Note) - 위스키 라이프를 기록하다',
    description:
      '위스키 리뷰, 테이스팅 노트, 평점을 기록하고 공유하세요. 다양한 위스키 정보와 커뮤니티를 만나보세요.',
    images: [
      {
        url: '/bottle_note_meta.png',
        width: 1200,
        height: 630,
        alt: 'Bottle Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '보틀노트(Bottle Note) - 위스키 라이프를 기록하다',
    description:
      '위스키 리뷰, 테이스팅 노트, 평점을 기록하고 공유하세요. 다양한 위스키 정보와 커뮤니티를 만나보세요.',
    images: ['/bottle_note_meta.png'],
  },
  robots: isProd
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
  verification: {
    google: 'jDr8C5vmXK2uiW-5H8XZWL3M0UeNXZHXrHPm4o0zguo',
    other: {
      'naver-site-verification': 'dc80d9fa4f1a60c4b1da445bf258a1b3ccaeaadc',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // iOS specific
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="touch-manipulation">
      <body suppressHydrationWarning>
        <WebVitalsReporter />
        <Providers>
          <div className="relative w-full bg-bgGray">
            {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
              />
            )}
            <div className="max-w-content justify-center items-center mx-auto">
              {children}
            </div>

            <div id="modal" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
