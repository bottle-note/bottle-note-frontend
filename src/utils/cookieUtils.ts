/**
 * 서버 응답 헤더에서 Set-Cookie 값을 파싱하는 유틸리티 함수들
 */

const REFRESH_TOKEN_COOKIE_NAMES = [
  'refresh-token',
  'bn_refresh_token',
  'refreshToken',
] as const;

const getSetCookieHeaders = (response: Response): string[] => {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === 'function') {
    const setCookieHeaders = headers.getSetCookie();

    if (setCookieHeaders.length > 0) {
      return setCookieHeaders;
    }
  }

  const setCookieHeader = response.headers.get('set-cookie');

  return setCookieHeader ? [setCookieHeader] : [];
};

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
  const setCookieHeaders = getSetCookieHeaders(response);

  for (const setCookieHeader of setCookieHeaders) {
    const cookieValue = extractCookieFromHeader(setCookieHeader, cookieName);

    if (cookieValue) {
      return cookieValue;
    }
  }

  return null;
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

  return cookieEntry.slice(cookieName.length + 1).trim() || null;
}

/**
 * 서버 응답에서 refresh-token 쿠키를 추출합니다.
 * @param response - fetch Response 객체
 * @returns refresh token 값 또는 빈 문자열
 */
export function extractRefreshToken(response: Response): string {
  for (const cookieName of REFRESH_TOKEN_COOKIE_NAMES) {
    const refreshToken = extractCookieFromResponse(response, cookieName);

    if (refreshToken) {
      return refreshToken;
    }
  }

  return '';
}
