'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/ui/Loading/Loading';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';

const RETURN_TO_KEY = 'login_return_to';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');
  const { login } = useAuth();

  const loginHandler = async (code: string | string[]) => {
    try {
      const returnTo = sessionStorage.getItem(RETURN_TO_KEY) || '/';
      sessionStorage.removeItem(RETURN_TO_KEY);

      await login(
        'kakao-login',
        {
          authorizationCode: code,
          callbackUrl: returnTo,
        },
        true,
      );
    } catch (e) {
      console.log(e);
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
