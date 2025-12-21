/**
 * 로그인 후 리다이렉트를 위한 유틸리티
 */

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

/**
 * returnTo URL을 안전하게 가져오고 sessionStorage에서 제거
 */
export const getReturnToUrl = (): string => {
  if (typeof window === 'undefined') return '/';

  const returnTo = sessionStorage.getItem(LOGIN_RETURN_TO_KEY);
  sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);

  return returnTo && isValidReturnUrl(returnTo) ? returnTo : '/';
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
