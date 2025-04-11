'use client';

import { useLayoutEffect } from 'react';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import '@/style/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initWebView } = useWebViewInit();

  useLayoutEffect(() => {
    initWebView();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-subCoral">
      <main className="flex flex-col flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
