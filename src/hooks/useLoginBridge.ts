'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  isValidReturnUrl,
  LOGIN_RETURN_TO_PARAM,
  setReturnToUrl,
} from '@/utils/loginRedirect';
import { setLoginTrigger } from '@/utils/loginTrigger';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { LoginTrigger } from '@/utils/analytics/types';

interface LoginOptions {
  returnTo?: string;
  trigger?: LoginTrigger;
}

/** 모달과 CTA가 같은 복귀 경로 전달 방식으로 현재 화면을 로그인으로 교체한다. */
export const useLoginBridge = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const currentUrl = `${pathname}${query ? `?${query}` : ''}`;

  const bridgeToLogin = ({
    returnTo = currentUrl,
    trigger,
  }: LoginOptions = {}) => {
    if (trigger) {
      setLoginTrigger(trigger);
      trackGA4Event('login_prompt_shown', { trigger });
    }
    const destination =
      returnTo && isValidReturnUrl(returnTo) ? returnTo : ROUTES.HOME;
    setReturnToUrl(destination);
    router.replace(
      `${ROUTES.LOGIN}?${LOGIN_RETURN_TO_PARAM}=${encodeURIComponent(destination)}`,
    );
  };

  return { bridgeToLogin };
};
