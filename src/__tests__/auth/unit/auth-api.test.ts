import { AuthApi } from '@/api/auth/auth.api';

const createResponse = ({
  body,
  ok = true,
  status = 200,
  refreshToken,
}: {
  body: unknown;
  ok?: boolean;
  status?: number;
  refreshToken?: string;
}) =>
  ({
    ok,
    status,
    json: async () => body,
    headers: {
      getSetCookie: () =>
        refreshToken
          ? [
              `refresh-token=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Lax`,
            ]
          : [],
      get: () => null,
    },
  }) as unknown as Response;

describe('카카오 v2 로그인 API 계약', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as typeof fetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.SERVER_URL_V2 = 'https://api-v2.example.com';
  });

  it('카카오 SDK access token을 v2 검증 API로 보내고 Bottle Note 토큰을 반환한다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: {
          accessToken: 'bottle-access-token',
          isFirstLogin: false,
          nickname: '테스트사용자',
        },
        refreshToken: 'bottle-refresh-token',
      }),
    );

    const tokens = await AuthApi.server.kakaoLogin({
      accessToken: 'kakao-sdk-access-token',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-v2.example.com/auth/kakao',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'kakao-sdk-access-token',
        }),
      }),
    );
    expect(tokens).toEqual({
      accessToken: 'bottle-access-token',
      refreshToken: 'bottle-refresh-token',
    });
  });

  it('v2 검증 API가 실패하면 로그인 실패로 처리한다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: { message: 'INVALID_KAKAO_ACCESS_TOKEN' },
        ok: false,
        status: 401,
      }),
    );

    await expect(
      AuthApi.server.kakaoLogin({
        accessToken: 'invalid-kakao-access-token',
      }),
    ).rejects.toThrow('Kakao login failed');
  });

  it('Bottle Note access token이 없는 성공 응답은 로그인 성공으로 처리하지 않는다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: {
          isFirstLogin: false,
          nickname: '테스트사용자',
        },
        refreshToken: 'bottle-refresh-token',
      }),
    );

    await expect(
      AuthApi.server.kakaoLogin({
        accessToken: 'kakao-sdk-access-token',
      }),
    ).rejects.toThrow('Bottle Note access token not found');
  });

  it('Bottle Note refresh token 쿠키가 없는 성공 응답은 로그인 성공으로 처리하지 않는다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: {
          accessToken: 'bottle-access-token',
          isFirstLogin: false,
          nickname: '테스트사용자',
        },
      }),
    );

    await expect(
      AuthApi.server.kakaoLogin({
        accessToken: 'kakao-sdk-access-token',
      }),
    ).rejects.toThrow('Bottle Note refresh token not found');
  });
});

describe('카카오 웹 authorization code 교환 계약', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as typeof fetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.KAKAO_REST_API_KEY = 'kakao-rest-api-key';
    process.env.CLIENT_URL = 'https://client.example.com';
  });

  it('authorization code를 카카오 access token으로 교환한다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: {
          access_token: 'kakao-sdk-access-token',
        },
      }),
    );

    const token = await AuthApi.server.fetchKakaoToken(
      'kakao-authorization-code',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://kauth.kakao.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams),
      }),
    );

    const requestBody = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(requestBody.get('grant_type')).toBe('authorization_code');
    expect(requestBody.get('client_id')).toBe('kakao-rest-api-key');
    expect(requestBody.get('redirect_uri')).toBe(
      'https://client.example.com/oauth/kakao',
    );
    expect(requestBody.get('code')).toBe('kakao-authorization-code');
    expect(token).toEqual({ access_token: 'kakao-sdk-access-token' });
  });

  it('카카오 토큰 교환 API가 실패하면 로그인을 중단한다', async () => {
    fetchMock.mockResolvedValueOnce(
      createResponse({
        body: {
          error: 'invalid_grant',
        },
        ok: false,
        status: 400,
      }),
    );

    await expect(
      AuthApi.server.fetchKakaoToken('invalid-authorization-code'),
    ).rejects.toThrow('Kakao token exchange failed');
  });
});

describe('AuthApi.server.renewToken', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as typeof fetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.SERVER_URL = 'https://api.example.com';
  });

  it('문서 계약대로 /oauth/reissue에 refresh-token 헤더로 요청한다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'new-access-token',
        },
      }),
      headers: {
        getSetCookie: () => [
          'refresh-token=new-refresh-token; Path=/; HttpOnly; Secure',
        ],
        get: () => null,
      },
    } as unknown as Response);

    const tokens = await AuthApi.server.renewToken('current-refresh-token');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/oauth/reissue',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'refresh-token': 'current-refresh-token',
          'Content-Type': 'application/json',
        }),
      }),
    );

    expect(tokens).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });
});
