/**
 * 로그인 유도 컨텍스트를 전달하기 위한 유틸리티
 *
 * 비로그인 유저가 특정 행동(별점, 찜 등)을 시도하다 로그인 모달을 거쳐
 * OAuth 콜백까지 도달했을 때, "어떤 행동에서 로그인으로 왔는지"를 유지한다.
 * loginRedirect.ts의 returnToUrl과 동일한 sessionStorage consume 패턴.
 */

import type { LoginTrigger } from '@/utils/analytics/types';

const LOGIN_TRIGGER_KEY = 'bn_login_trigger';

/**
 * 로그인 유도 시점의 trigger를 sessionStorage에 저장한다.
 */
export const setLoginTrigger = (trigger: LoginTrigger): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LOGIN_TRIGGER_KEY, trigger);
};

/**
 * trigger를 읽고 즉시 삭제한다 (consume 패턴).
 * 로그인 완료 시점에서 호출하여, 이전에 저장된 trigger를 소비한다.
 */
export const consumeLoginTrigger = (): LoginTrigger | null => {
  if (typeof window === 'undefined') return null;

  const trigger = sessionStorage.getItem(LOGIN_TRIGGER_KEY);
  sessionStorage.removeItem(LOGIN_TRIGGER_KEY);

  return trigger as LoginTrigger | null;
};
