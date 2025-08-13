/**
 * 서버 응답 헤더에서 Set-Cookie 값을 파싱하는 유틸리티 함수들
 */

/**
 * Set-Cookie 헤더에서 특정 쿠키 값을 추출합니다.
 * @param response - fetch Response 객체
 * @param cookieName - 추출할 쿠키 이름
 * @returns 쿠키 값 또는 null (찾지 못한 경우)
 */
export function extractCookieFromResponse(
  response: Response,
  cookieName: string,
): string | null {
  const setCookieHeader = response.headers.getSetCookie()[0];
  if (!setCookieHeader) {
    return null;
  }

  return extractCookieFromHeader(setCookieHeader, cookieName);
}

/**
 * Set-Cookie 헤더 문자열에서 특정 쿠키 값을 추출합니다.
 * @param setCookieHeader - Set-Cookie 헤더 문자열
 * @param cookieName - 추출할 쿠키 이름
 * @returns 쿠키 값 또는 null (찾지 못한 경우)
 */
export function extractCookieFromHeader(
  setCookieHeader: string,
  cookieName: string,
): string | null {
  const cookieEntry = setCookieHeader
    .split(';')
    .find((item) => item.trim().startsWith(`${cookieName}=`));

  if (!cookieEntry) {
    return null;
  }

  return cookieEntry.split('=')[1] || null;
}

/**
 * 서버 응답에서 refresh-token 쿠키를 추출합니다.
 * @param response - fetch Response 객체
 * @returns refresh token 값 또는 빈 문자열
 */
export function extractRefreshToken(response: Response): string {
  return extractCookieFromResponse(response, 'refresh-token') || '';
}
