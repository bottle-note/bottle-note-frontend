import { AuthService } from '@/lib/AuthService';
import { AuthApi } from '@/app/api/AuthApi';
import useModalStore from '@/store/modalStore';
import { ApiError } from '@/utils/ApiError';

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

    // 토큰 검증 및 인증 헤더 설정
    const headers = new Headers(fetchOptions.headers);

    if (useAuth) {
      const token = AuthService.getToken();

      // 인증이 필요하지만 토큰이 없는 경우
      if (!token) {
        AuthService.logout();
        const { handleLoginState } = useModalStore.getState();
        handleLoginState(true);
        throw new Error('Authentication required');
      }

      headers.set('Authorization', `Bearer ${token.accessToken}`);
    }

    // Content-Type 기본값 설정 (이미 설정되어 있지 않은 경우)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // 요청 URL 구성
    const requestUrl = `/${baseUrl}${endpoint}`;

    // 요청 옵션 구성
    const requestOptions: RequestInit = {
      ...this.defaultOptions,
      ...fetchOptions,
      cache,
      headers,
    };

    try {
      // API 요청 수행
      const response = await fetch(requestUrl, requestOptions);

      // 응답 처리
      let result;
      try {
        result = await response.json();
      } catch {
        // JSON 파싱 실패 시 (예: 204 No Content)
        result = null;
      }

      // 응답이 실패한 경우
      if (!response.ok) {
        // 토큰 만료 (403) 및 재시도 로직
        if (result?.code === 403 && retryCount < 1 && useAuth) {
          try {
            const token = AuthService.getToken();
            if (token) {
              const newTokens = await AuthApi.renewTokenClientSide(
                token.refreshToken,
              );
              AuthService.setToken(newTokens);

              // 새 토큰으로 재시도
              return this.request<T>(endpoint, options, retryCount + 1);
            }
          } catch (refreshError) {
            AuthService.logout();
            const { handleLoginState } = useModalStore.getState();
            handleLoginState(true);
            throw new ApiError('Token refresh failed', response);
          }
        }

        // 기타 에러 처리
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
