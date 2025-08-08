'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/Loading';
import { ROUTES } from '@/constants/routes';
import { signIn } from 'next-auth/react';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');

  const loginHandler = async (code: string | string[]) => {
    try {
      signIn('kakao-login', {
        authroizationCode: code,
      });
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
