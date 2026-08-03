'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/ui/Loading/Loading';
import { ROUTES } from '@/constants/routes';
import { useSocialLogin } from '@/hooks/useSocialLogin';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');
  const { completeKakaoWebLogin } = useSocialLogin();

  const loginHandler = async (code: string) => {
    try {
      await completeKakaoWebLogin(code);
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
