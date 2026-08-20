'use client';

import { useEffect } from 'react';
import useModalStore from '@/store/modalStore';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import LoginModal from '@/components/domain/auth/LoginModal';
import StackTransitionProvider from './_components/StackTransitionProvider';

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
    <StackTransitionProvider>
      <div className="bg-bg-layer-default text-fg-neutral flex flex-col w-full mx-auto min-h-safe-screen">
        <main>{children}</main>
        {loginState.isShowLoginModal && (
          <LoginModal
            handleClose={() => handleLoginState(false)}
            returnTo={loginState.returnTo}
          />
        )}
      </div>
    </StackTransitionProvider>
  );
}
