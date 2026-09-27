'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { completeLoginPageReplacement } from '@/hooks/useLoginNavigation';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import { restoreAuthSession } from './session-store';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const pathname = usePathname();
  const { isLoading, isLoggedIn } = useAuthSession();

  useEffect(() => {
    // 외부 인증 전 문서가 복원되면 로그인 전 세션 상태도 다시 확인한다.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void restoreAuthSession();
    };

    window.addEventListener('pageshow', handlePageShow);
    void restoreAuthSession();
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (completeLoginPageReplacement()) return;
    if (isLoading || isLoggedIn) return;
    if (
      pathname === '/login' ||
      pathname.startsWith('/oauth/') ||
      pathname === '/agreements'
    ) {
      return;
    }
    // 상단 버튼뿐 아니라 브라우저 뒤로가기로 취소한 로그인도 정리한다.
    consumeLoginTrigger();
  }, [pathname, isLoading, isLoggedIn]);

  return <>{children}</>;
}
