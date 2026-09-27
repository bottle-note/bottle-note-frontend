import { NextRequest, NextResponse } from 'next/server';
import {
  createLoginResponse,
  createLogoutResponse,
  createSessionResponse,
  readRefreshTokenCookie,
} from '@/lib/auth/server';
import { loginPayloadSchema } from '@/lib/auth/login-payload';
import { ApiError } from '@/utils/ApiError';
import { getReturnToUrl } from '@/utils/loginRedirect';

export async function POST(request: NextRequest) {
  try {
    const parsedPayload = loginPayloadSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsedPayload.success) {
      return NextResponse.json(
        { message: 'Invalid login payload' },
        { status: 400 },
      );
    }

    return await createLoginResponse(parsedPayload.data);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Authentication failed',
        code: error instanceof ApiError ? error.code : undefined,
      },
      { status: error instanceof ApiError ? error.response.status : 500 },
    );
  }
}

// 로그인 진입 시 만료된 세션을 갱신하고 쿠키와 복귀 주소를 브라우저에 전달한다.
export async function GET(request: NextRequest) {
  const returnTo = getReturnToUrl(request.nextUrl.searchParams.get('returnTo'));
  let destination = returnTo;
  let sessionResponse: NextResponse;

  try {
    const refreshToken = await readRefreshTokenCookie();
    if (!refreshToken) throw new Error('No refresh token');
    sessionResponse = await createSessionResponse(refreshToken);
  } catch {
    sessionResponse = createLogoutResponse();
    destination = `/login?${new URLSearchParams({ returnTo })}`;
  }

  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: destination },
  });
  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));
  return response;
}
