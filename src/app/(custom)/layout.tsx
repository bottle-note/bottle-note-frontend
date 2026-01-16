'use client';

import { useEffect } from 'react';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import '@/style/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initWebView, isMobile } = useWebViewInit();

  useEffect(() => {
    initWebView();
  }, [isMobile]);

  return (
    <div className="flex flex-col w-full min-h-safe-screen bg-subCoral pt-safe">
      <main className="flex flex-col flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
