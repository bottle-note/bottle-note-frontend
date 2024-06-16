import { NextRequest, NextResponse } from 'next/server';
import { AuthApi } from '../AuthApi';
import { encode, getToken } from 'next-auth/jwt';
import { updateCookie } from '@/utils/updateCookie';

export async function PATCH(req: NextRequest, res: NextResponse) {
  const jwt = await getToken({ req });

  if (!jwt) {
    return NextResponse.json(
      { error: '세션이 존재하지 않습니다.' },
      { status: 401 },
    );
  }

  const refreshToken = jwt?.refreshToken as string;

  if (!refreshToken) {
    return NextResponse.json(
      { error: '리프레시 토큰이 존재하지 않습니다.' },
      { status: 401 },
    );
  }

  try {
    const newTokens = await AuthApi.renewAccessToken(refreshToken);

    // TODO: 새로운 세션 쿠키를 만들어서 저장해준다.
    const newSessionToken = await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      token: {
        ...jwt,
        ...newTokens,
      },
      maxAge: 604800,
    });

    updateCookie(newSessionToken, req, res);

    return NextResponse.json({ data: newTokens }, { status: 200 });
  } catch (e) {
    const error = e as Error;

    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
