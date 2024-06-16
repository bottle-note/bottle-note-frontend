import { NextRequest, NextResponse } from 'next/server';

export function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse,
) {
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  if (sessionToken) {
    request.cookies.set(sessionCookie, sessionToken);

    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    response.cookies.set(sessionCookie, sessionToken, {
      httpOnly: true,
      maxAge: 604800,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } else {
    request.cookies.delete(sessionCookie);
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.cookies.delete(sessionCookie);
  }

  return response;
}
