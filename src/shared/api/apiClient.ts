import { AuthApi } from '@/app/api/AuthApi';
import useModalStore from '@/store/modalStore';
import { ApiError } from '@/utils/ApiError';
import { getSession, signOut } from 'next-auth/react';

interface ApiClientOptions extends RequestInit {
  useAuth?: boolean; // 인증 토큰 사용 여부 (기본: true)
  baseUrl?: 'bottle-api' | 'api'; // API 기본 경로 (기본: 'bottle-api')
  cache?: RequestCache; // 캐시 정책 (기본: 'no-store')
}

class ApiClient {
  private readonly defaultOptions: RequestInit = {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  /**
   * API 요청을 수행하는 메인 메서드
   */
  async request<T = any>(
    endpoint: string,
    options: ApiClientOptions = {},
    retryCount = 0,
  ): Promise<T> {
    const {
      useAuth = true,
      baseUrl = 'bottle-api',
      cache = 'no-store',
      ...fetchOptions
    } = options;

    const headers = new Headers(fetchOptions.headers);
    // 요청 전에 항상 최신 세션을 가져옵니다.
    const session = await getSession();

    if (useAuth) {
      if (!session) {
        signOut({ callbackUrl: '/login' });
        const { handleLoginState } = useModalStore.getState();
        handleLoginState(true);
        throw new Error('Authentication required');
      }

      headers.set('Authorization', `Bearer ${session.user.accessToken}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const requestUrl = `/${baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...this.defaultOptions,
      ...fetchOptions,
      cache,
      headers,
    };

    try {
      const response = await fetch(requestUrl, requestOptions);

      let result;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        if (result?.code === 403 && retryCount < 1 && useAuth && session) {
          try {
            // /api/token/renew 가 next-auth 세션까지 갱신해 줄 것임
            await AuthApi.client.renewToken(session.user.refreshToken);

            // 새 토큰으로 재시도
            return this.request<T>(endpoint, options, retryCount + 1);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            signOut({ callbackUrl: '/login' });
            throw new ApiError(
              'Token refresh failed',
              (refreshError as ApiError)?.response || response,
            );
          }
        }

        const errorMessage =
          result?.errors?.[0]?.message ||
          result?.message ||
          'API request failed';
        throw new ApiError(errorMessage, response);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('API Client Error:', error);
      throw new Error('Network error occurred');
    }
  }
  /**
   * GET 요청
   */
  async get<T = any>(
    endpoint: string,
    options: Omit<ApiClientOptions, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 요청
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<ApiClientOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<ApiClientOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<ApiClientOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(
    endpoint: string,
    options: Omit<ApiClientOptions, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();
