/**
 * 로그인 유도 컨텍스트를 전달하기 위한 유틸리티
 *
 * 비로그인 유저가 특정 행동(별점, 찜 등)이나 로그인 게이트를 거쳐
 * OAuth 콜백까지 도달했을 때, "어디에서 로그인으로 왔는지"를 유지한다.
 * loginRedirect.ts의 returnToUrl과 동일한 sessionStorage consume 패턴.
 */

import type { LoginGatePage, LoginTrigger } from '@/utils/analytics/types';

const LOGIN_TRIGGER_KEY = 'bn_login_trigger';
const LOGIN_GATE_PAGE_KEY = 'bn_login_gate_page';

export interface LoginContext {
  trigger?: LoginTrigger;
  gatePage?: LoginGatePage;
}

/**
 * 로그인 유도 시점의 컨텍스트를 sessionStorage에 저장한다.
 * 이전 유도에서 남은 값이 섞이지 않도록 전달하지 않은 항목은 지운다.
 */
export const setLoginContext = ({ trigger, gatePage }: LoginContext): void => {
  if (typeof window === 'undefined') return;

  if (trigger) sessionStorage.setItem(LOGIN_TRIGGER_KEY, trigger);
  else sessionStorage.removeItem(LOGIN_TRIGGER_KEY);

  if (gatePage) sessionStorage.setItem(LOGIN_GATE_PAGE_KEY, gatePage);
  else sessionStorage.removeItem(LOGIN_GATE_PAGE_KEY);
};

/**
 * 컨텍스트를 읽고 즉시 삭제한다 (consume 패턴).
 * 로그인 완료 시점에서 호출하여, 이전에 저장된 컨텍스트를 소비한다.
 */
export const consumeLoginContext = (): LoginContext => {
  if (typeof window === 'undefined') return {};

  const trigger = sessionStorage.getItem(LOGIN_TRIGGER_KEY);
  const gatePage = sessionStorage.getItem(LOGIN_GATE_PAGE_KEY);
  sessionStorage.removeItem(LOGIN_TRIGGER_KEY);
  sessionStorage.removeItem(LOGIN_GATE_PAGE_KEY);

  return {
    trigger: (trigger as LoginTrigger | null) ?? undefined,
    gatePage: (gatePage as LoginGatePage | null) ?? undefined,
  };
};
