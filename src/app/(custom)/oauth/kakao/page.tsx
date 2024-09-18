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
      // TODO: 여기서 result 를 로컬스토리지에 저장하도록 수정
      router.push('/');
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
