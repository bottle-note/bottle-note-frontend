'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/ui/Loading/Loading';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';
import { getReturnToUrl } from '@/utils/loginRedirect';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');
  const { login } = useAuth();

  const loginHandler = async (code: string | string[]) => {
    try {
      const returnTo = getReturnToUrl();

      await login('kakao-login', {
        authorizationCode: code,
      });

      router.replace(returnTo);
    } catch (e) {
      console.error(e);
      router.push(ROUTES.ERROR);
    }
  };

  useEffect(() => {
    if (authCode) {
      loginHandler(authCode);
    }
  }, [authCode]);

  return <Loading />;
}
