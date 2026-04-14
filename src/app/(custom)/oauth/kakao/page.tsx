'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/ui/Loading/Loading';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';
import { getReturnToUrl } from '@/utils/loginRedirect';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { consumeLoginTrigger } from '@/utils/loginTrigger';

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

      const trigger = consumeLoginTrigger();
      trackGA4Event('login', {
        method: 'kakao',
        trigger: trigger ?? undefined,
      });
      if (trigger) {
        trackGA4Event('login_prompt_converted', { trigger });
      }

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
