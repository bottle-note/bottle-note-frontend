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
  const { loginState, handleLoginState } = useModalStore();
  const { initWebView, isMobile } = useWebViewInit();

  useEffect(() => {
    initWebView();
  }, [isMobile]);

  return (
    <div className="flex min-h-safe-screen w-full mx-auto flex-col bg-bn-canvas text-bn-text">
      <main>{children}</main>
      {loginState.isShowLoginModal && (
        <LoginModal
          handleClose={() => handleLoginState(false)}
          returnTo={loginState.returnTo}
        />
      )}
    </div>
  );
}
