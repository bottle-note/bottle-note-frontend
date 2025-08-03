import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import {
  BasicSignupRes,
  LoginReq,
  LoginReturn,
  TokenData,
  UserData,
} from '@/types/Auth';
import { ApiResponse } from '@/types/common';
import { ApiError } from '@/utils/ApiError';
import { apiClient } from '@/shared/api/apiClient';

export const AuthApi = {
  // NOTE: 서버사이드에서 활용되는 로그인 메서드
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

  // NOTE: 클라이언트 사이드에서 서버사이드로 보내는 로그인 요청
  async clientLogin(
    body: Omit<LoginReq, 'gender' | 'age' | 'socialUniqueId'> & {
      socialUniqueId?: string;
    },
  ): Promise<{ tokens: TokenData; info: UserData }> {
    const response = await apiClient.post<{
      tokens: TokenData;
      info: UserData;
    }>(
      '/login',
      {
        ...body,
        socialUniqueId: body.socialUniqueId ?? '',
      },
      {
        baseUrl: 'api',
        useAuth: false,
      },
    );

    return response;
  },

  async renewTokenClientSide(refreshToken: string): Promise<TokenData> {
    try {
      const response = await apiClient.post<{ data: TokenData }>(
        '/token/renew',
        refreshToken,
        {
          baseUrl: 'api',
          useAuth: false,
        },
      );

      return response.data;
    } catch (e) {
      // 더 안전한 타입 체크
      if (e instanceof ApiError) {
        // 400 에러: 리프레시 토큰 만료/무효
        if (e.response.status === 400) {
          console.warn('Refresh token expired or invalid');
          AuthService.logout();
          const { handleLoginState: handleShowNeedLoginModal } =
            useModalStore.getState();
          handleShowNeedLoginModal(true);
          throw new ApiError(
            '리프레시 토큰이 만료되어 로그인이 필요합니다.',
            e.response,
          );
        }

        // 기타 API 에러
        console.error(
          `Token renewal failed: ${e.message} (Status: ${e.response.status})`,
        );
        throw e; // 원본 에러 유지
      }

      // 네트워크 에러 등 기타 에러
      const error =
        e instanceof Error ? e : new Error('Unknown error occurred');
      console.error(
        `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
      throw error;
    }
  },

  async kakaoLogin(code: string | string[]): Promise<LoginReturn> {
    try {
      const result = await apiClient.post<LoginReturn>(
        `/oauth/kakao?code=${code}`,
        {},
        {
          baseUrl: 'api',
          useAuth: false,
        },
      );

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
      const result = await apiClient.post<ApiResponse<{ accessToken: string }>>(
        `/oauth/basic/login`,
        { email, password },
      );

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
      const response = await apiClient.post<{ data: BasicSignupRes }>(
        `/oauth/basic/signup`,
        {
          email,
          password,
          age,
          gender,
        },
      );

      return response.data;
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
      const result = await apiClient.post<ApiResponse<{ data: string }>>(
        `/oauth/restore`,
        { email, password },
      );

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
      const response = await apiClient.put<{ data: string }>(
        `/oauth/token/verify`,
        {
          token: accessToken,
        },
      );

      return { data: response.data };
    } catch (e) {
      const error = e as Error;
      console.error(error.message);

      throw new Error(
        `토큰 검증 도중 에러가 발생했습니다. 사유: ${error.message}`,
      );
    }
  },
};
