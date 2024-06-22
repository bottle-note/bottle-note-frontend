import { LoginReq } from '@/types/Auth';
import { decode } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';

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
  async renewAccessTokenClientSide() {
    try {
      const response = await fetch('/api/token/renew', {
        method: 'POST',
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(`HTTP error! message: ${body.errors.message}`);
      }

      const newSession = await getSession();
      const newAccessToken = newSession?.user.accessToken;

      return newAccessToken;
    } catch (e) {
      const error = e as Error;

      console.error(
        `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },
  async renewAccessToken(refreshToken: string) {
    if (!refreshToken) throw new Error('리프레시 토큰이 존재하지 않습니다.');

    try {
      const response = await fetch(`${process.env.SERVER_URL}/oauth/reissue`, {
        method: 'POST',
        headers: {
          'refresh-token': refreshToken,
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
