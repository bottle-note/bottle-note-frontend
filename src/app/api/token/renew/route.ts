import { NextRequest, NextResponse } from 'next/server';
import { getToken, encode } from 'next-auth/jwt';
import { decodeJwt } from 'jose';
import { AuthApi } from '@/api/auth/auth.api';
import { UserData } from '@/api/auth/types';

const secret = process.env.NEXTAUTH_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

const cookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: '리프레시 토큰이 존재하지 않습니다.' },
        { status: 400 },
      );
    }

    const newTokens = await AuthApi.server.renewToken(refreshToken);
    const currentToken = await getToken({ req, secret });
    if (!currentToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const newUserInfo = decodeJwt(newTokens.accessToken) as UserData;

    const updatedNextAuthToken = {
      ...currentToken,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      iat: newUserInfo.iat,
      exp: newUserInfo.exp,
      email: newUserInfo.sub,
      roles: newUserInfo.roles,
      userId: newUserInfo.userId,
    };

    const newSessionCookie = await encode({
      token: updatedNextAuthToken,
      secret: secret!,
    });

    const response = NextResponse.json(newTokens, { status: 200 });
    response.cookies.set({
      name: cookieName,
      value: newSessionCookie,
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error(
      `토큰 업데이트 도중 에러가 발생했습니다. 사유: ${(error as Error).message}`,
    );
    return NextResponse.json(
      { error: `토큰 업데이트 도중 에러가 발생했습니다.` },
      { status: 500 },
    );
  }
}
