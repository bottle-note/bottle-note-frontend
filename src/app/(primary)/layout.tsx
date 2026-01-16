'use client';

import { useEffect } from 'react';
import useModalStore from '@/store/modalStore';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import LoginModal from '@/components/domain/auth/LoginModal';

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
    <div className="bg-white flex flex-col w-full mx-auto min-h-safe-screen">
      <main>{children}</main>
      {loginState.isShowLoginModal && (
        <LoginModal handleClose={handleLoginModal} />
      )}
    </div>
  );
}
