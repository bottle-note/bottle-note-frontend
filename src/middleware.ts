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

    const session = request.cookies.get(sessionCookie);
    const sessionDecoded: any = await decode({
      token: session?.value,
      secret: process.env.NEXTAUTH_SECRET ?? '',
    });

    // 새롭게 발급받은 토큰 정보로 현재 세션 쿠키 업데이트
    try {
      const newTokens = await AuthApi.renewAccessToken(
        sessionDecoded?.refreshToken,
      );

      const newSessionToken = await encode({
        secret: process.env.NEXTAUTH_SECRET as string,
        token: {
          ...sessionDecoded,
          ...newTokens,
        },
        maxAge: 30 * 24 * 60 * 60,
      });

      request.cookies.set(sessionCookie, newSessionToken);
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      response.cookies.set(sessionCookie, newSessionToken);

      return response;
    } catch (e) {
      console.error(e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
