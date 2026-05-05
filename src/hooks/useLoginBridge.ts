import useModalStore from '@/store/modalStore';
import { setLoginTrigger } from '@/utils/loginTrigger';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { LoginTrigger } from '@/utils/analytics/types';

/**
 * 로그인 유도 모달을 열면서 trigger 컨텍스트 저장 + GA4 이벤트를 발화하는 합성 훅.
 *
 * modalStore와 LoginModal은 GA4를 모르는 상태를 유지하고,
 * 이 훅이 modalStore + loginTrigger + GA4를 조합하는 유일한 지점이다.
 */
export const useLoginBridge = () => {
  const { handleLoginModal } = useModalStore();

  const bridgeToLogin = (trigger?: LoginTrigger) => {
    if (trigger) {
      setLoginTrigger(trigger);
      trackGA4Event('login_prompt_shown', { trigger });
    }
    handleLoginModal();
  };

  return { bridgeToLogin };
};
