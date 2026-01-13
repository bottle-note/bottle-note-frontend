import { signOut } from 'next-auth/react';
import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import { ApiError } from '@/utils/ApiError';
import { extractRefreshToken } from '@/utils/cookieUtils';
import useModalStore from '@/store/modalStore';
import type {
  LoginParams,
  AppleLoginParams,
  KakaoLoginParams,
  BasicLoginParams,
  BasicSignupParams,
  RestoreParams,
  TokenData,
  BasicSignupResponse,
} from './types';

const getRedirectUrl = () => `${process.env.CLIENT_URL}/oauth/kakao`;

export const AuthApi = {
  // ========== 서버사이드 API (Next.js API Routes에서 사용) ==========
  server: {
    /**
     * 소셜 로그인을 수행합니다.
     */
    async login(body: LoginParams): Promise<TokenData> {
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

    /**
     * Apple 로그인을 수행합니다.
     */
    async appleLogin(body: AppleLoginParams): Promise<TokenData> {
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

    /**
     * Kakao 로그인을 수행합니다.
     */
    async kakaoLogin(body: KakaoLoginParams): Promise<TokenData> {
      const response = await fetch(`${process.env.SERVER_URL_V2}/auth/kakao`, {
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

    /**
     * 토큰을 갱신합니다 (서버사이드).
     */
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
        throw new Error(ERROR_MESSAGES.TOKEN_REFRESH_FAILED);
      }

      const { data } = await response.json();
      return data;
    },

    /**
     * Kakao OAuth 토큰을 가져옵니다 (웹 SDK 로그인용).
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
     * Kakao 사용자 정보를 가져옵니다.
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
    /**
     * 토큰을 갱신합니다 (클라이언트사이드).
     */
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
        if (e instanceof ApiError) {
          if (e.response.status === 400) {
            console.warn('Refresh token expired or invalid');
            signOut({ callbackUrl: '/login' });
            const { handleLoginState } = useModalStore.getState();
            handleLoginState(true);
            throw new ApiError(ERROR_MESSAGES.TOKEN_EXPIRED, e.response);
          }

          console.error(
            `Token renewal failed: ${e.message} (Status: ${e.response.status})`,
          );
          throw e;
        }

        const error =
          e instanceof Error ? e : new Error('Unknown error occurred');
        console.error(
          `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${error.message}`,
        );
        throw error;
      }
    },

    /**
     * 회원 계정을 복구합니다.
     */
    async restore(params: RestoreParams): Promise<ApiResponse<string>> {
      const response = await apiClient.post<ApiResponse<{ data: string }>>(
        `/oauth/restore`,
        params,
        { baseUrl: 'bottle-api/v2', authRequired: false },
      );

      if (response.errors.length !== 0) {
        throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
      }

      return response as unknown as ApiResponse<string>;
    },

    /**
     * 액세스 토큰을 검증합니다.
     */
    async verifyToken(accessToken: string): Promise<ApiResponse<string>> {
      const response = await apiClient.put<ApiResponse<string>>(
        `/oauth/token/verify`,
        { token: accessToken },
        { baseUrl: 'bottle-api/v2', authRequired: false },
      );

      if (response.errors.length !== 0) {
        throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
      }

      return response;
    },

    /**
     * Apple 로그인용 nonce를 가져옵니다.
     */
    async getAppleNonce(): Promise<string> {
      const response = await apiClient.get<{ nonce: string }>(
        `/auth/apple/nonce`,
        { baseUrl: 'bottle-api/v2', authRequired: false },
      );

      return response.nonce;
    },
  },

  // ========== Deprecated APIs ==========

  /**
   * @deprecated 기본 로그인 (이메일/비밀번호)
   */
  async basicLogin(
    params: BasicLoginParams,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      `/oauth/basic/login`,
      params,
      { baseUrl: 'bottle-api/v2' },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    return response;
  },

  /**
   * @deprecated 기본 회원가입 (이메일/비밀번호)
   */
  async basicSignup(
    params: BasicSignupParams,
  ): Promise<ApiResponse<BasicSignupResponse>> {
    const response = await apiClient.post<ApiResponse<BasicSignupResponse>>(
      `/oauth/basic/signup`,
      params,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.CREATE_FAILED);
    }

    return response;
  },
};

// Re-export types and enums
export { SOCIAL_TYPE } from './types';
export type { LoginParams, TokenData, UserData } from './types';
