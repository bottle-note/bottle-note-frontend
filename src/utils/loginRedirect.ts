/**
 * 로그인 후 리다이렉트를 위한 유틸리티
 */

import { ROUTES } from '@/constants/routes';

export const LOGIN_RETURN_TO_PARAM = 'returnTo';
export const LOGIN_RETURN_TO_KEY = 'login_return_to';

// 리다이렉트 제외 경로 (무한 루프 방지)
const BLOCKED_PATHS = ['/login', '/oauth'];

/**
 * URL이 안전한지 검증 (Open Redirect 방지)
 * - 상대 경로만 허용 (/ 로 시작하고 // 로 시작하지 않는 경우)
 * - 로그인 관련 경로 제외
 * - 백슬래시, URL 인코딩, 공백 문자 우회 차단
 */
export const isValidReturnUrl = (url: string): boolean => {
  if (!url || url === '/') return true;

  // 기본 검증: /로 시작하고 //로 시작하지 않아야 함
  if (!url.startsWith('/') || url.startsWith('//')) return false;

  // 백슬래시 우회 차단 (일부 브라우저에서 \를 /로 해석)
  if (url.includes('\\')) return false;

  // URL 인코딩된 슬래시 우회 차단 (%2f, %2F)
  if (/%2f/i.test(url)) return false;

  // 공백 문자 우회 차단 (탭, 개행, 공백 등)
  if (/[\t\n\r ]/.test(url.slice(1, 3))) return false;

  // 로그인 관련 경로 차단
  if (BLOCKED_PATHS.some((path) => url.startsWith(path))) return false;

  return true;
};

/** 외부 인증에서 돌아올 때 사용할 저장소 목적지를 읽는다. */
export const getPendingReturnToUrl = (): string | null => {
  if (typeof window === 'undefined') return null;

  const returnTo = sessionStorage.getItem(LOGIN_RETURN_TO_KEY);
  return returnTo && isValidReturnUrl(returnTo) ? returnTo : null;
};

/** 쿼리 → 저장소 → 홈 순서로 읽는다. 잘못된 쿼리는 저장소 대신 홈으로 처리한다. */
export const getReturnToFromSearchParams = (
  searchParams: Pick<URLSearchParams, 'get'>,
): string => {
  const returnTo = searchParams.get(LOGIN_RETURN_TO_PARAM);
  if (returnTo !== null) {
    return returnTo && isValidReturnUrl(returnTo) ? returnTo : ROUTES.HOME;
  }

  return getPendingReturnToUrl() ?? ROUTES.HOME;
};

export const clearReturnToUrl = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
};

/**
 * returnTo URL을 sessionStorage에 저장
 */
export const setReturnToUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  if (!isValidReturnUrl(url)) return;
  if (sessionStorage.getItem(LOGIN_RETURN_TO_KEY) === url) return;

  sessionStorage.setItem(LOGIN_RETURN_TO_KEY, url);
};
