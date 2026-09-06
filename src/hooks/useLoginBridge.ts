import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import useModalStore from '@/store/modalStore';
import { setLoginTrigger } from '@/utils/loginTrigger';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { LoginTrigger } from '@/utils/analytics/types';

/**
 * 로그인 유도 시 trigger 컨텍스트 저장 + GA4 이벤트를 발화하고,
 * 호출 화면에 따라 모달 또는 로그인 페이지 이동을 제공하는 합성 훅.
 *
 * modalStore와 LoginModal은 GA4를 모르는 상태를 유지하고,
 * 이 훅이 modalStore + loginTrigger + GA4를 조합하는 유일한 지점이다.
 */
export const useLoginBridge = () => {
  const router = useRouter();
  const { handleLoginModal } = useModalStore();

  const trackLoginPrompt = (trigger?: LoginTrigger) => {
    if (trigger) {
      setLoginTrigger(trigger);
      trackGA4Event('login_prompt_shown', { trigger });
    }
  };

  const bridgeToLogin = (trigger?: LoginTrigger) => {
    trackLoginPrompt(trigger);
    handleLoginModal();
  };

  const navigateToLogin = (trigger?: LoginTrigger, returnTo?: string) => {
    trackLoginPrompt(trigger);

    const returnToQuery = returnTo
      ? `?returnTo=${encodeURIComponent(returnTo)}`
      : '';

    router.push(`${ROUTES.LOGIN}${returnToQuery}`);
  };

  return { bridgeToLogin, navigateToLogin };
};
