import { AuthApi } from './auth.api';

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
    } as Response);

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
