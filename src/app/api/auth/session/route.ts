import { NextResponse } from 'next/server';
import {
  createCachedSessionResponse,
  createSessionResponse,
  isAccessTokenValid,
  readAccessTokenCookie,
  readRefreshTokenCookie,
} from '@/lib/auth/server';

export async function GET() {
  try {
    // 캐시된 access token이 유효하면 백엔드 호출 없이 반환
    const cachedAccessToken = await readAccessTokenCookie();

    if (cachedAccessToken && isAccessTokenValid(cachedAccessToken)) {
      return createCachedSessionResponse(cachedAccessToken);
    }

    // 캐시 miss → refresh token으로 백엔드 갱신
    const refreshToken = await readRefreshTokenCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 },
      );
    }

    return await createSessionResponse(refreshToken);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Session restore failed',
      },
      { status: 401 },
    );
  }
}
