import { AuthApi } from '@/app/api/AuthApi';
import { accessTokenService } from './TokenService';
import { ApiResponse } from '@/types/common';

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
  const defaultOptions = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessTokenService.get()}`,
      'Content-Type': 'application/json',
    },
  };

  const requestUrl = `${url}`;

  try {
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      const res: ApiResponse<any> = await response.json();

      // case 1: 에러 코드가 403인 경우 -> 기간 만료이므로 리프레시 토큰으로 갱신
      if (res.code === 403 && retryCount < 1) {
        try {
          const accessToken = await AuthApi.renewAccessTokenClientSide();

          console.log(accessToken, '새로 발급받은 액세스 토큰');

          accessTokenService.save(accessToken);

          return fetchWithAuth(url, options, retryCount + 1);
        } catch (e) {
          const error = e as Error;
          console.error(error.message);
        }
      }

      // case 2: 에러 코드가 401인 경우 -> 인증된 유저가 아니므로 로그인 페이지로 이동?
      if (response.status === 401) {
        alert('로그인이 필요한 서비스 입니다.');
        return window.location.assign('/login');
      }

      // case 3: 그 이외의 에러는 throw
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // TODO: 적절한 에러처리 필요!
    console.error('Fetch error:', error);
  }
};
