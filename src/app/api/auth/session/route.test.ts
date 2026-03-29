/**
 * @jest-environment node
 */
import { SignJWT } from 'jose';
import { GET } from './route';

const SECRET = new TextEncoder().encode('test-secret-key-for-signing-jwt');

async function createTestJwt(exp: number) {
  return new SignJWT({
    sub: 'tester@bottle-note.com',
    userId: 1,
    roles: 'ROLE_USER',
    profile: null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(SECRET);
}

// --- mocks ---

const mockCookieStore = new Map<string, string>();

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: (name: string) => {
      const value = mockCookieStore.get(name);
      return value ? { value } : undefined;
    },
  })),
}));

const mockRenewToken = jest.fn();

jest.mock('@/api/auth/auth.api', () => ({
  AuthApi: {
    server: { renewToken: (...args: unknown[]) => mockRenewToken(...args) },
  },
}));

// --- helpers ---

function setCookies(entries: Record<string, string>) {
  mockCookieStore.clear();
  Object.entries(entries).forEach(([k, v]) => mockCookieStore.set(k, v));
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

// --- tests ---

beforeEach(() => {
  mockCookieStore.clear();
  mockRenewToken.mockReset();
});

describe('GET /api/auth/session', () => {
  it('access token 쿠키가 유효하면 백엔드 호출 없이 세션을 반환한다', async () => {
    const validToken = await createTestJwt(Math.floor(Date.now() / 1000) + 600);
    setCookies({ bn_access_token: validToken, bn_refresh_token: 'rt' });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accessToken).toBe(validToken);
    expect(body.user.sub).toBe('tester@bottle-note.com');

    // 백엔드 renewToken 호출 안 함
    expect(mockRenewToken).not.toHaveBeenCalled();
  });

  it('access token 쿠키가 만료됐으면 refresh token으로 갱신하여 새 토큰을 반환한다', async () => {
    const expiredToken = await createTestJwt(
      Math.floor(Date.now() / 1000) - 100,
    );
    const newToken = await createTestJwt(Math.floor(Date.now() / 1000) + 600);

    setCookies({ bn_access_token: expiredToken, bn_refresh_token: 'rt' });
    mockRenewToken.mockResolvedValueOnce({
      accessToken: newToken,
      refreshToken: 'new-rt',
    });

    const response = await GET();
    const body = await response.json();
    const cookies = getCookieMap(response);

    expect(response.status).toBe(200);
    expect(body.accessToken).toBe(newToken);

    // 백엔드 renewToken 호출됨
    expect(mockRenewToken).toHaveBeenCalledWith('rt');

    // 새 access token 쿠키 설정됨
    expect(cookies.get('bn_access_token')?.value).toBe(newToken);
    expect(cookies.get('bn_access_token')?.maxAge).toBeGreaterThan(0);

    // refresh token 쿠키도 갱신됨
    expect(cookies.get('bn_refresh_token')?.value).toBe('new-rt');
  });

  it('access token 쿠키가 없으면 refresh token으로 갱신한다', async () => {
    const newToken = await createTestJwt(Math.floor(Date.now() / 1000) + 600);

    setCookies({ bn_refresh_token: 'rt' });
    mockRenewToken.mockResolvedValueOnce({
      accessToken: newToken,
      refreshToken: 'new-rt',
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accessToken).toBe(newToken);
    expect(mockRenewToken).toHaveBeenCalledWith('rt');
  });

  it('두 쿠키 모두 없으면 401을 반환한다', async () => {
    setCookies({});

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockRenewToken).not.toHaveBeenCalled();
  });

  it('renewToken이 실패하면 401을 반환한다', async () => {
    setCookies({ bn_refresh_token: 'rt' });
    mockRenewToken.mockRejectedValueOnce(new Error('Backend error'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe('Backend error');
  });
});
