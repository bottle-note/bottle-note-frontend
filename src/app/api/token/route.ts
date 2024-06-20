import { decode } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const updatedSessionToken = req.cookies.get(sessionCookie);

  const updatedTokenDecoded: any = await decode({
    token: updatedSessionToken?.value,
    secret: process.env.NEXTAUTH_SECRET ?? '',
  });

  return NextResponse.json(
    { data: updatedTokenDecoded?.accessToken },
    { status: 200 },
  );
}
