import { LoginReq } from '@/types/Auth';

export const AuthApi = {
  async login(body: LoginReq): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await fetch(`/bottle-api/oauth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const cookie: string = response.headers.getSetCookie()[0] ?? '';
    const refreshToken = (
      cookie
        .split(';')
        .find((item) => item.trim().startsWith('refresh-token=')) as string
    ).split('=')[1];

    const { data } = await response.json();

    return {
      accessToken: data.accessToken,
      refreshToken,
    };
  },

  async updateAccessToken() {
    const response = await fetch(`/bottle-api/oauth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data } = await response.json();
    return data.accessToken;
  },
};
