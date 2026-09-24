'use client';

import { ReactNode, useEffect, useLayoutEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { trackLoginHistory } from '@/utils/loginHistory';
import { clearReturnToUrl } from '@/utils/loginRedirect';
import { consumeLoginTrigger } from '@/utils/loginTrigger';
import { restoreAuthSession } from './session-store';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, isLoggedIn } = useAuthSession();

  // 로그인 페이지의 effect보다 먼저 현재 히스토리 위치를 확인한다.
  useLayoutEffect(() => {
    trackLoginHistory();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      trackLoginHistory();
      void restoreAuthSession();
    };
    window.addEventListener('popstate', trackLoginHistory);
    window.addEventListener('pageshow', handlePageShow);
    void restoreAuthSession();
    return () => {
      window.removeEventListener('popstate', trackLoginHistory);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (isLoading || isLoggedIn) return;
    if (
      pathname === '/login' ||
      pathname.startsWith('/oauth/') ||
      pathname === '/agreements'
    ) {
      return;
    }
    // 상단 버튼뿐 아니라 브라우저 뒤로가기로 취소한 로그인도 정리한다.
    clearReturnToUrl();
    consumeLoginTrigger();
  }, [pathname, isLoading, isLoggedIn]);

  return <>{children}</>;
}
