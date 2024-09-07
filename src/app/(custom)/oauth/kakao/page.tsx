'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OauthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authCode = searchParams.get('code');

  const loginHandler = async (code: string | string[]) => {
    try {
      const res = await fetch(`/api/oauth/kakao?code=${code}`, {
        method: 'POST',
      });
      const result = await res.json();
      // if (result?.data?.id) {
      router.replace('/');
      // }

      console.log('data returned from api: ', result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (authCode) {
      loginHandler(authCode);
    }
  }, [authCode]);

  return <div>카카오 로그인 진행중입니다...</div>;
}
