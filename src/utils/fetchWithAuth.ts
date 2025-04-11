import { AuthApi } from '@/app/api/AuthApi';
import useModalStore from '@/store/modalStore';
import { ApiError } from './ApiError';
import { AuthService } from '../lib/AuthService';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  preferAuth?: boolean;
  cache?: RequestCache;
}

type FetchWithAuth = (
  url: string,
  options?: FetchOptions,
  retryCount?: number,
) => Promise<any>;

export const fetchWithAuth: FetchWithAuth = async (
  url,
  options = {},
  retryCount = 0,
) => {
  const {
    requireAuth = true,
    preferAuth = true,
    cache = 'no-store',
    ...fetchOptions
  } = options;

  const token = AuthService.getToken();

  // 1. 인증 필수 + 토큰 X -> 로그인 예외
  if (requireAuth && !token) {
    AuthService.logout();
    const { handleLoginState } = useModalStore.getState();
    handleLoginState(true);
    throw new Error('Authentication required');
  }

  const requestUrl = `${url}`;

  let res: any = new Error('API 호출 중 에러가 발생했습니다.');

  // 2. 인증 필수 X + 토큰 X -> 그냥 요청
  if ((!requireAuth && !preferAuth) || !token) {
    try {
      const response = await fetch(requestUrl, {
        ...fetchOptions,
        cache,
      });

      if (!response.ok) {
        res = await response.json();
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('API Error Response of fetch:', error.response);
      }
      throw error;
    }
  }

  // 인증이 필요한 요청의 기본 옵션 구성
  const defaultOptions = {
    ...fetchOptions,
    cache,
    headers: {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    // API 요청 수행 (인증 포함)
    const response = await fetch(requestUrl, defaultOptions);

    // 응답이 실패한 경우 → 에러 응답 저장
    if (!response.ok) {
      res = await response.json();

      // 토큰이 만료된 경우 (403) → 리프레시 토큰으로 재시도
      if (res.code === 403 && retryCount < 1) {
        try {
          // 새로운 토큰 요청
          const newTokens = await AuthApi.renewTokenClientSide(
            token.refreshToken,
          );

          // 새로운 토큰 저장
          AuthService.setToken(newTokens);

          // 새로운 토큰이 없으면 에러 처리
          if (!newTokens) {
            throw new Error('갱신된 액세스 토큰이 존재하지 않습니다.');
          }

          // 재귀적으로 fetchWithAuth를 다시 호출하여 요청 재시도
          return await fetchWithAuth(url, fetchOptions, retryCount + 1);
        } catch (e) {
          throw new ApiError(`HTTP error! ${e}`, response);
        }
      }
    }

    // 정상 응답 반환
    return await response.json();
  } catch (error) {
    // ApiError 발생 시 콘솔에 상세 정보 출력
    if (error instanceof ApiError) {
      console.log('API Error Response:', error.response);
    }
    throw res;
  }
};
