import { decode } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const updatedSessionToken = req.cookies.get(sessionCookie);

  const updatedTokenDecoded = await decode({
    token: updatedSessionToken?.value,
    secret: process.env.NEXTAUTH_SECRET ?? '',
  });

  console.log('3. 갱신되었을 것으로 생각되는 세션', updatedTokenDecoded);

  return NextResponse.json(
    { data: updatedTokenDecoded?.accessToken },
    { status: 200 },
  );
}
