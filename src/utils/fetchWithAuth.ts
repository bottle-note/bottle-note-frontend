import { getSession } from 'next-auth/react';
import { accessTokenService } from './TokenService';
import { ApiResponse } from '@/types/common';

export async function fetchWithAuth(url: string, options?: RequestInit) {
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
      if (res.code === 403) {
        const session = await getSession();
        return console.log(
          session?.user.token.refreshToken,
          '리프레시 토큰은 여기에 있어용',
        );
      }

      // case 2: 에러 코드가 401인 경우 -> 인증된 유저가 아니므로 로그인 페이지로 이동?
      if (res.code === 401) {
        return console.log(res);
      }

      // case 3: 그 이외의 에러는 throw
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // TODO: 적절한 에러처리 필요!
    console.error('Fetch error:', error);
  }
}
