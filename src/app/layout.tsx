import type { Metadata, Viewport } from 'next';
import '@/style/globals.css';
import { Providers } from '@/lib/Providers';

export const metadata: Metadata = {
  title: 'Bottle Note',
  description: '위스키 라이프를 기록하다, 보틀 노트.',
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
    <html lang="en" className="touch-manipulation">
      <body suppressHydrationWarning>
        <Providers>
          <body className="relative">
            {children}
            <div id="modal" />
          </body>
        </Providers>
      </body>
    </html>
  );
}
