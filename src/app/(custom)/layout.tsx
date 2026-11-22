'use client';

import { useEffect } from 'react';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import ContentWidth from '@/components/ui/Layout/ContentWidth';
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
    <ContentWidth
      size="mobile"
      className="flex flex-col min-h-safe-screen bg-subCoral"
    >
      <main className="flex flex-col flex-grow overflow-y-auto">
        {children}
      </main>
    </ContentWidth>
  );
}
