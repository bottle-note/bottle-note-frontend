'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthApi } from '@/app/api/AuthApi';
import { useAuth } from '@/utils/useAuth';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');
  const { login } = useAuth();

  const loginHandler = async (code: string | string[]) => {
    try {
      const result = await AuthApi.kakaoLogin(code);
      login(result.info, result.tokens);
      router.push('/login');
    } catch (e) {
      console.log(e);
      router.push('/error');
    }
  };

  useEffect(() => {
    if (authCode) {
      loginHandler(authCode);
    }
  }, [authCode]);

  return <div>카카오 로그인 진행중입니다...</div>;
}