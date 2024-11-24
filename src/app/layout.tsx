import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/style/globals.css';
import { Providers } from '@/lib/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bottle Note',
  description: '위스키 라이프를 기록하다, 보틀 노트.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
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
