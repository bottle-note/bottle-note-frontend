/**
 * 로그인 후 리다이렉트를 위한 유틸리티
 */

// SessionStorage 키 상수
export const LOGIN_RETURN_TO_KEY = 'login_return_to';

/**
 * URL이 안전한지 검증 (Open Redirect 방지)
 * - 상대 경로는 허용 (/ 로 시작하고 // 로 시작하지 않는 경우)
 * - 절대 경로는 차단 (외부 URL 방지)
 */
export const isValidReturnUrl = (url: string): boolean => {
  // 빈 값이거나 '/'인 경우 허용
  if (!url || url === '/') return true;

  // 프로토콜 상대 URL 차단 (//로 시작)
  if (url.startsWith('//')) {
    return false;
  }

  // 상대 경로 (/ 로 시작하는 경우)
  if (url.startsWith('/')) {
    return true;
  }

  // 그 외 모든 경우 (절대 URL, javascript:, data: 등) 차단
  return false;
};

/**
 * returnTo URL을 안전하게 가져오고 sessionStorage에서 제거
 */
export const getReturnToUrl = (): string => {
  if (typeof window === 'undefined') return '/';

  const returnTo = sessionStorage.getItem(LOGIN_RETURN_TO_KEY);
  sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);

  // URL 검증
  if (returnTo && isValidReturnUrl(returnTo)) {
    return returnTo;
  }

  return '/';
};

/**
 * returnTo URL을 sessionStorage에 저장
 */
export const setReturnToUrl = (url: string): void => {
  if (typeof window === 'undefined') return;

  // 저장 전에도 검증
  if (isValidReturnUrl(url)) {
    sessionStorage.setItem(LOGIN_RETURN_TO_KEY, url);
  }
};
