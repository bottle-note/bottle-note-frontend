import type { Metadata } from 'next';
import '@/style/globals.css';

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
    <div className="bg-white flex flex-col w-full mx-auto min-h-screen">
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
