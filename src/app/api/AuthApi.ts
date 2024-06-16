import { LoginReq } from '@/types/Auth';

export const AuthApi = {
  async login(body: LoginReq): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await fetch(`${process.env.SERVER_URL}/oauth/login`, {
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

  async renewAccessToken(refreshToken: string) {
    if (!refreshToken) throw new Error('리프레시 토큰이 존재하지 않습니다.');

    // NOTE: 아니 왜 헤더를 넣었는데 헤더가 없대?! 토큰 넣었는데 왜 토큰이 없대?!
    try {
      const response = await fetch(`${process.env.SERVER_URL}/oauth/reissue`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(`HTTP error! message: ${body.errors.message}`);
      }

      const cookie: string = response.headers.getSetCookie()[0] ?? '';
      const newRefreshToken = (
        cookie
          .split(';')
          .find((item) => item.trim().startsWith('refresh-token=')) as string
      ).split('=')[1];
      const { data } = await response.json();

      return {
        accessToken: data.accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(
        `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },
};
