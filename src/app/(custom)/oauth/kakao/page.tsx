'use client';

import { useEffect } from 'react';
import Loading from '@/components/ui/Loading/Loading';
import { useSocialLogin } from '@/hooks/useSocialLogin';

export default function OauthKakaoCallbackPage() {
  const { handleKakaoCallback } = useSocialLogin();

  useEffect(() => {
    void handleKakaoCallback();
  }, [handleKakaoCallback]);

  return <Loading />;
}
