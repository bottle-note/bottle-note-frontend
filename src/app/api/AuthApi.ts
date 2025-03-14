import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import { BasicSignupRes, LoginReq, LoginReturn } from '@/types/Auth';
import { ApiResponse } from '@/types/common';
import { ApiError } from '@/utils/ApiError';

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
  async renewTokenClientSide(refreshToken: string) {
    try {
      const response = await fetch('/api/token/renew', {
        method: 'POST',
        body: JSON.stringify(refreshToken),
      });

      if (!response.ok) {
        const statusCode = response.status;
        const body = await response.json();

        if (statusCode === 400) {
          AuthService.logout();

          const { handleLoginState } = useModalStore.getState();
          return handleLoginState(true);
        }

        throw new Error(`HTTP error! message: ${body.errors.message}`);
      }

      const { data: newTokens } = await response.json();

      return newTokens;
    } catch (e) {
      const error = e as Error;

      console.error(
        `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },

  async kakaoLogin(code: string | string[]): Promise<LoginReturn> {
    try {
      const res = await fetch(`/api/oauth/kakao?code=${code}`, {
        method: 'POST',
      });

      const result: LoginReturn = await res.json();

      return result;
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(
        `카카오 소셜 로그인 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },

  async basicLogin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    try {
      const res = await fetch(`/bottle-api/oauth/basic/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{ accessToken: string }> = await res.json();

      if (!res.ok) {
        const errorCode = result.errors?.[0]?.code;

        throw new ApiError(
          result.errors?.[0]?.message || 'Login failed.',
          res,
          errorCode,
        );
      }

      return result.data;
    } catch (e) {
      if (e instanceof ApiError) {
        console.error(
          `Login failed: ${e.message} (Status: ${e.response.status})`,
        );
      }

      throw e;
    }
  },

  async basicSignup({
    email,
    password,
    age,
    gender,
  }: {
    email: string;
    password: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | null;
  }): Promise<BasicSignupRes> {
    try {
      const res = await fetch(`/bottle-api/oauth/basic/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          age,
          gender,
        }),
      });

      if (!res.ok) {
        const result: ApiResponse<BasicSignupRes> = await res.json();

        throw new Error(result.errors[0].message);
      }

      const { data } = await res.json();

      return data;
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(error.message);
    }
  },

  async restore({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ data: string }> {
    try {
      const res = await fetch(`/bottle-api/oauth/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{ data: string }> = await res.json();

      if (!res.ok) {
        const errorCode = result.errors?.[0]?.code;

        throw new ApiError(
          result.errors?.[0]?.message || 'Restore failed.',
          res,
          errorCode,
        );
      }

      return result.data;
    } catch (e) {
      if (e instanceof ApiError) {
        console.error(
          `Login failed: ${e.message} (Status: ${e.response.status})`,
        );
      }

      throw e;
    }
  },

  async verifyToken(accessToken: string) {
    try {
      const res = await fetch(`/bottle-api/oauth/token/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: accessToken,
        }),
      });

      const { data } = await res.json();

      return { data };
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(
        `토큰 검증 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },

  /**
   * @deprecated
   * */
  async guestLogin() {
    try {
      const res = await fetch(`/bottle-api/oauth/guest-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'Ym90dGxlbm90ZWd1ZXN0Zm9yYWRucm9pZA==',
        }),
      });

      const { data } = await res.json();

      return { accessToken: data.accessToken };
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(
        `게스트 로그인 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },
};
