import { decode, getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: 자자 여기서 해야하는 일에 대해서 알아봅시다...
// 1. 토큰을 심어서 보낸다.
// 2. 토큰 갱신이 필요한지 여부를 확인한다.
// 3. 토큰 갱신이 필요하다면, 응답 쿠키에서 리프레시 토큰을 꺼낸 뒤 재 요청 후 액세스토큰 갱신
// 4. 이 때 토큰 갱신시... 흠... 이걸 어떻게 처리해준담? ^^?

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const sessionJWT = await getToken({
    req: request,
    raw: true,
    cookieName: 'next-auth.session-token',
  });

  const decoded = await decode({
    token: sessionJWT,
    secret: process.env.NEXTAUTH_SECRET as string,
  });

  const accessToken = decoded?.accessToken;

  // FIXME: 리디렉션 정상 동작 X
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
