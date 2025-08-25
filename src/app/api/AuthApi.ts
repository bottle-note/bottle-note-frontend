import { signOut } from 'next-auth/react';
import useModalStore from '@/store/modalStore';
import { BasicSignupRes, LoginReq, LoginReturn, TokenData } from '@/types/Auth';
import { ApiResponse } from '@/types/common';
import { ApiError } from '@/utils/ApiError';
import { extractRefreshToken } from '@/utils/cookieUtils';
import { apiClient } from '@/shared/api/apiClient';

const getRedirectUrl = () => `${process.env.CLIENT_URL}/oauth/kakao`;

export const AuthApi = {
  // ========== 서버사이드 API (Next.js API Routes에서 사용) ==========
  server: {
    // NOTE: 서버사이드에서 백엔드로 직접 요청
    async login(body: LoginReq): Promise<TokenData> {
      const response = await fetch(`${process.env.SERVER_URL}/oauth/login`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const refreshToken = extractRefreshToken(response);

      const { data } = await response.json();

      return {
        accessToken: data.accessToken,
        refreshToken,
      };
    },

    async appleLogin(body: { idToken: string; nonce: string }) {
      const response = await fetch(`${process.env.SERVER_URL_V2}/auth/apple`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const refreshToken = extractRefreshToken(response);

      const data = await response.json();

      return {
        accessToken: data.accessToken,
        refreshToken,
      };
    },

    async kakaoLogin({ accessToken }: { accessToken: string }) {
      try {
        const response = await fetch(
          `${process.env.SERVER_URL_V2}/auth/kakao`,
          {
            method: 'POST',
            body: JSON.stringify({ accessToken }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const refreshToken = extractRefreshToken(response);

        const data = await response.json();

        return {
          accessToken: data.accessToken,
          refreshToken,
        };
      } catch (e) {
        console.error(e);
        throw e;
      }
    },

    async renewToken(refreshToken: string): Promise<TokenData> {
      const response = await fetch(
        `${process.env.SERVER_URL}/oauth/token/renew`,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Token renewal failed');
      }

      const { data } = await response.json();
      return data;
    },

    /**
     *
     * @description web 환경 client side 에서 sdk 로그인을 위한 함수
     */
    async fetchKakaoToken(code: string) {
      const clientId = process.env.KAKAO_REST_API_KEY;
      const redirectUri = getRedirectUrl();

      const res = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: String(clientId),
          redirect_uri: String(redirectUri),
          code: String(code),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return res.json();
    },

    /**
     *
     * @description web 환경 client side 에서 sdk 로그인을 위한 함수
     */
    async fetchKakaoUserInfo(accessToken: string) {
      const res = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      return res.json();
    },
  },

  // ========== 클라이언트사이드 API (브라우저에서 사용) ==========
  client: {
    async renewToken(refreshToken: string): Promise<TokenData> {
      try {
        const response = await apiClient.post<{ data: TokenData }>(
          '/token/renew',
          { refreshToken },
          {
            baseUrl: 'bottle-api/v2',
            authRequired: false,
          },
        );

        return response.data;
      } catch (e) {
        // 더 안전한 타입 체크
        if (e instanceof ApiError) {
          // 400 에러: 리프레시 토큰 만료/무효
          if (e.response.status === 400) {
            console.warn('Refresh token expired or invalid');
            signOut({ callbackUrl: '/login' });
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

    // NOTE: 회원 복구 api
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
          { baseUrl: 'bottle-api/v2' },
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
          { baseUrl: 'bottle-api/v2' },
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

    async getAppleNonce() {
      try {
        const response = await apiClient.get<{ nonce: string }>(
          `/auth/apple/nonce`,
          { baseUrl: 'bottle-api/v2', authRequired: false },
        );

        return response.nonce;
      } catch (e) {
        const error = e as Error;
        console.error(error.message);

        throw new Error(error.message);
      }
    },
  },

  /**
   * @deprecated
   */
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
        { baseUrl: 'bottle-api/v2' },
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

  /**
   * @deprecated
   */
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
};
