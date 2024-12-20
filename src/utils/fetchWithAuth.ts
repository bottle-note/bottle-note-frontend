import { AuthApi } from '@/app/api/AuthApi';
import useModalStore from '@/store/modalStore';
import { ApiError } from './ApiError';
import { AuthService } from '../lib/AuthService';

type FetchWithAuth = (
  url: string,
  options?: RequestInit,
  retryCount?: number,
) => Promise<any>;

export const fetchWithAuth: FetchWithAuth = async (
  url,
  options,
  retryCount = 0,
) => {
  const token = AuthService.getToken();

  if (!token) {
    AuthService.logout();
    const { handleLoginState } = useModalStore.getState();
    return handleLoginState(true);
  }

  const defaultOptions = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const requestUrl = `${url}`;
  let res: any = new Error('API 호출 중 에러가 발생했습니다.');

  try {
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      res = await response.json();

      // case 1: 에러 코드가 403인 경우 -> 기간 만료이므로 리프레시 토큰으로 갱신
      if (res.code === 403 && retryCount < 1) {
        try {
          const newTokens = await AuthApi.renewTokenClientSide(
            token.refreshToken,
          );

          AuthService.setToken(newTokens);

          if (!newTokens) {
            throw new Error('갱신된 액세스 토큰이 존재하지 않습니다.');
          }

          return await fetchWithAuth(url, options, retryCount + 1);
        } catch (e) {
          throw new ApiError(`HTTP error! ${e}`, response);
        }
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('API Error Response:', error.response);
    }
    throw res;
  }
};
