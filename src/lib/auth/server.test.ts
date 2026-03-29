/**
 * @jest-environment node
 */
import { SignJWT } from 'jose';
import {
  isAccessTokenValid,
  createCachedSessionResponse,
  createSessionResponse,
  createLogoutResponse,
} from './server';

jest.mock('@/api/auth/auth.api', () => ({
  AuthApi: {
    server: {
      renewToken: jest.fn(),
    },
  },
}));

const SECRET = new TextEncoder().encode('test-secret-key-for-signing-jwt');

async function createTestJwt(overrides: { exp?: number; sub?: string } = {}) {
  const now = Math.floor(Date.now() / 1000);

  const builder = new SignJWT({
    sub: overrides.sub ?? 'tester@bottle-note.com',
    userId: 1,
    roles: 'ROLE_USER',
    profile: null,
  }).setProtectedHeader({ alg: 'HS256' });

  if (overrides.exp !== undefined) {
    builder.setExpirationTime(overrides.exp);
  }

  builder.setIssuedAt(now);

  return builder.sign(SECRET);
}

function getCookieMap(response: Response) {
  const cookies = new Map<string, { value: string; maxAge?: number }>();

  response.headers.getSetCookie().forEach((header) => {
    const [nameValue, ...attrs] = header.split(';').map((s) => s.trim());
    const eqIdx = nameValue.indexOf('=');
    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);
    const maxAgeAttr = attrs.find((a) =>
      a.toLowerCase().startsWith('max-age='),
    );
    const maxAge = maxAgeAttr ? Number(maxAgeAttr.split('=')[1]) : undefined;

    cookies.set(name, { value, maxAge });
  });

  return cookies;
}

describe('isAccessTokenValid', () => {
  it('만료까지 충분한 시간이 남은 토큰은 유효하다', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const token = await createTestJwt({ exp: futureExp });

    expect(isAccessTokenValid(token)).toBe(true);
  });

  it('만료까지 60초 이내인 토큰은 유효하지 않다 (버퍼)', async () => {
    const nearExp = Math.floor(Date.now() / 1000) + 30;
    const token = await createTestJwt({ exp: nearExp });

    expect(isAccessTokenValid(token)).toBe(false);
  });

  it('이미 만료된 토큰은 유효하지 않다', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const token = await createTestJwt({ exp: pastExp });

    expect(isAccessTokenValid(token)).toBe(false);
  });

  it('exp 클레임이 없는 토큰은 유효하지 않다', async () => {
    const token = await new SignJWT({ sub: 'test' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(SECRET);

    expect(isAccessTokenValid(token)).toBe(false);
  });

  it('잘못된 형식의 문자열은 유효하지 않다', () => {
    expect(isAccessTokenValid('not-a-jwt')).toBe(false);
    expect(isAccessTokenValid('')).toBe(false);
  });
});

describe('createCachedSessionResponse', () => {
  it('유효한 JWT로 세션 응답을 생성하며 쿠키를 설정하지 않는다', async () => {
    const token = await createTestJwt({
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    const response = createCachedSessionResponse(token);
    const body = await response.json();

    expect(body.accessToken).toBe(token);
    expect(body.user.sub).toBe('tester@bottle-note.com');
    expect(body.user.userId).toBe(1);

    // 캐시 응답은 쿠키를 새로 설정하지 않아야 함
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });
});

describe('createSessionResponse', () => {
  it('refresh 성공 시 access token과 refresh token 쿠키를 모두 설정한다', async () => {
    const { AuthApi } = jest.requireMock('@/api/auth/auth.api');
    const accessToken = await createTestJwt({
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    AuthApi.server.renewToken.mockResolvedValueOnce({
      accessToken,
      refreshToken: 'new-refresh-token',
    });

    const response = await createSessionResponse('old-refresh-token');
    const body = await response.json();
    const cookies = getCookieMap(response);

    // 응답 body 검증
    expect(body.accessToken).toBe(accessToken);
    expect(body.user.sub).toBe('tester@bottle-note.com');

    // refresh token 쿠키 검증
    expect(cookies.get('bn_refresh_token')?.value).toBe('new-refresh-token');
    expect(cookies.get('bn_refresh_token')?.maxAge).toBeGreaterThan(0);

    // access token 쿠키 검증
    expect(cookies.get('bn_access_token')?.value).toBe(accessToken);
    expect(cookies.get('bn_access_token')?.maxAge).toBeGreaterThan(0);
    expect(cookies.get('bn_access_token')?.maxAge).toBeLessThanOrEqual(600);
  });
});

describe('createLogoutResponse', () => {
  it('로그아웃 시 access token과 refresh token 쿠키를 모두 삭제한다', () => {
    const response = createLogoutResponse();
    const cookies = getCookieMap(response);

    expect(cookies.get('bn_refresh_token')?.maxAge).toBe(0);
    expect(cookies.get('bn_access_token')?.maxAge).toBe(0);
  });
});
