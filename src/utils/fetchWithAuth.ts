import { getSession } from 'next-auth/react';
import { accessTokenService } from './TokenService';

export async function fetchWithAuth(url: string, options?: RequestInit) {
  const defaultOptions = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessTokenService.get()}`,
      'Content-Type': 'application/json',
    },
  };

  // TODO: 캐치블록 내부로 이동
  const session = await getSession();
  console.log(session);

  const requestUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;

  try {
    const response = await fetch(requestUrl, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // TODO: 에러가 발생했을 때 리프레시 토큰으로 갱신 요청

    console.error('Fetch error:', error);
  }
}
