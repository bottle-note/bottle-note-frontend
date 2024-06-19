import { decode, encode } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthApi } from './app/api/AuthApi';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const resetCookie = () => {
    const response = NextResponse.redirect(new URL('/login', request.url));

    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes('next-auth'))
        response.cookies.delete(cookie.name);
    });

    return response;
  };

  if (pathname.startsWith('/api/token/renew')) {
    const cookiesList = request.cookies.getAll();
    const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    // 세션 쿠키가 존재하지 않는 경우, 모든 쿠키 삭제 후 로그인 페이지로 이동
    if (!cookiesList.some((cookie) => cookie.name.includes(sessionCookie))) {
      resetCookie();
    }

    const session = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/session`,
      {
        headers: {
          'content-type': 'application/json',
          cookie: request.cookies.toString(),
        },
      } satisfies RequestInit,
    );
    const json = await session.json();
    const data = Object.keys(json).length > 0 ? json : null;

    // 세션토큰이 유효하지 않은 경우 역시 로그인 페이지로 이동 및 쿠키 삭제
    if (!session.ok || !data?.user) {
      resetCookie();
    }

    // 새롭게 발급받은 토큰 정보로 현재 세션 쿠키 업데이트
    const newTokens = await AuthApi.renewAccessToken(
      data.user.token.refreshToken,
    );
    const response = NextResponse.next();
    const newSessionToken = await encode({
      secret: process.env.NEXTAUTH_SECRET as string,
      token: {
        ...data,
        user: {
          ...newTokens,
        },
      },
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set(sessionCookie, newSessionToken);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
