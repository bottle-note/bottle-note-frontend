import {
  extractCookieFromHeader,
  extractCookieFromResponse,
  extractRefreshToken,
} from './cookieUtils';

const createResponseWithSetCookie = (setCookieHeaders: string[]) =>
  ({
    headers: {
      getSetCookie: () => setCookieHeaders,
      get: (name: string) =>
        name.toLowerCase() === 'set-cookie'
          ? setCookieHeaders[0] || null
          : null,
    },
  }) as Response;

describe('cookieUtils', () => {
  describe('extractCookieFromHeader', () => {
    it('쿠키 값에 = 문자가 포함되어도 전체 값을 유지한다', () => {
      expect(
        extractCookieFromHeader(
          'refresh-token=abc.def==; Path=/; HttpOnly',
          'refresh-token',
        ),
      ).toBe('abc.def==');
    });
  });

  describe('extractCookieFromResponse', () => {
    it('첫 번째가 아닌 Set-Cookie 헤더에서도 대상 쿠키를 찾는다', () => {
      const response = createResponseWithSetCookie([
        'other-cookie=123; Path=/; HttpOnly',
        'refresh-token=refresh-token-value; Path=/; HttpOnly',
      ]);

      expect(extractCookieFromResponse(response, 'refresh-token')).toBe(
        'refresh-token-value',
      );
    });
  });

  describe('extractRefreshToken', () => {
    it('프로젝트에서 사용하는 bn_refresh_token 이름도 허용한다', () => {
      const response = createResponseWithSetCookie([
        'bn_refresh_token=stored-refresh-token; Path=/; HttpOnly',
      ]);

      expect(extractRefreshToken(response)).toBe('stored-refresh-token');
    });
  });
});
