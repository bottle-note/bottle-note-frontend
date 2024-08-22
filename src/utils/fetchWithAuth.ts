import { getSession } from 'next-auth/react';
import { AuthApi } from '@/app/api/AuthApi';
import { ApiError } from './ApiError';

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
  const session = await getSession();

  const defaultOptions = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${session?.user.accessToken}`,
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
          const newAccessToken = await AuthApi.renewAccessTokenClientSide();

          if (!newAccessToken) {
            throw new Error('갱신된 액세스 토큰이 존재하지 않습니다.');
          }

          return await fetchWithAuth(url, options, retryCount + 1);
        } catch (e) {
          throw new ApiError(`HTTP error! ${e}`, response);
        }
      }

      // case 2: 에러 코드가 401인 경우 -> 인증된 유저가 아니므로 로그인 페이지로 이동?
      if (response.status === 401) {
        alert('로그인이 필요한 서비스 입니다.');
        return window.location.assign('/login');
      }

      // case 3: 그 이외의 에러는 throw
      throw new ApiError(`HTTP error! status: ${response.status}`, response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('API Error Response:', error.response);
    }
    throw res;
  }
};
