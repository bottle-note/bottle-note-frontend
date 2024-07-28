import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode, encode } from 'next-auth/jwt';
import { AuthApi } from '../../AuthApi';

export async function POST(req: NextRequest, res: NextResponse) {
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
  const session = req.cookies.get(sessionCookie);
  // FIXME: JWT 토큰 타입에 access, refresh 토큰 데이터 타입 추가
  const decoded: any = await decode({
    token: session?.value,
    secret: process.env.NEXTAUTH_SECRET ?? '',
  });
  const { refreshToken } = decoded;

  try {
    const newTokens = await AuthApi.renewAccessToken(refreshToken);
    const newSessionToken = await encode({
      secret: process.env.NEXTAUTH_SECRET as string,
      token: {
        ...decode,
        ...newTokens,
      },
      maxAge: 30 * 24 * 60 * 60,
    });

    cookies().set({
      name: sessionCookie,
      value: newSessionToken,
    });

    return NextResponse.json(
      { res, data: newTokens.accessToken },
      {
        status: 200,
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
