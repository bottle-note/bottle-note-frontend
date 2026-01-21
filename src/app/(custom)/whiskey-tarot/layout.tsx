'use client';

import { useEffect } from 'react';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import '@/style/globals.css';

export default function WhiskeyTarotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initWebView, isMobile } = useWebViewInit();

  useEffect(() => {
    initWebView();
  }, [isMobile]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0a0a0f]">
      <main className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
