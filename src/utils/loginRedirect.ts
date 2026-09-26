/**
 * 로그인 후 리다이렉트를 위한 유틸리티
 */

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

/** 쿼리에서 전달받은 복귀 주소를 검증하고, 없거나 잘못된 경우 홈을 사용한다. */
export const getReturnToUrl = (returnTo: string | null): string =>
  returnTo && isValidReturnUrl(returnTo) ? returnTo : '/';
