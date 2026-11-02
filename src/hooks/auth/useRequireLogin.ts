'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from './useAuthSession';

/**
 * 로그인해야 쓸 수 있는 페이지에 직접 들어온 비로그인 사용자를 로그인 페이지로 보낸다.
 * 로그인을 마치면 `returnTo`(기본: 지금 주소와 쿼리)로 돌아온다.
 */
export const useRequireLogin = (returnTo?: string) => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading || isLoggedIn) return;

    const target =
      returnTo ?? `${window.location.pathname}${window.location.search}`;
    router.replace(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(target)}`);
  }, [isLoading, isLoggedIn, returnTo, router]);
};
