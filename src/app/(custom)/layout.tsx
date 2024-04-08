import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/style/globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bottle Note',
  description: '위스키 라이프를 기록하다, 보틀 노트.',
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
          <div className="bg-white flex flex-col w-full mx-auto max-w-[400px] min-h-screen">
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
