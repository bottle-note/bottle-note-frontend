'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { setLoginContext, type LoginContext } from '@/utils/loginTrigger';
import { trackGA4Event } from '@/utils/analytics/ga4';

/**
 * 로그인 페이지로 이동하면서 유도 컨텍스트 저장 + GA4 이벤트를 발화하는 합성 훅.
 * returnTo로 현재 경로를 저장하여 로그인 후 돌아올 수 있다.
 */
export const useLoginBridge = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const bridgeToLogin = ({ trigger, gatePage }: LoginContext = {}) => {
    setLoginContext({ trigger, gatePage });
    if (trigger) {
      trackGA4Event('login_prompt_shown', { trigger });
    }
    const returnTo = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return { bridgeToLogin };
};
