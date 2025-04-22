'use client';

import { useEffect } from 'react';
import useModalStore from '@/store/modalStore';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import LoginModal from './_components/LoginModal';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginState, handleLoginModal } = useModalStore();
  const { initWebView, isMobile } = useWebViewInit();

  useEffect(() => {
    initWebView();
  }, [isMobile]);

  return (
    <div className="bg-white flex flex-col w-full mx-auto min-h-screen pb-12">
      <main className="flex-1 overflow-y-auto">{children}</main>
      {loginState.isShowLoginModal && (
        <LoginModal handleClose={handleLoginModal} />
      )}
    </div>
  );
}
