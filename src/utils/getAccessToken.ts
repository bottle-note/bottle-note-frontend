import { decode, getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getAccesstoken(req: NextRequest) {
  const sessionJWT = await getToken({
    req,
    raw: true,
    cookieName: 'next-auth.session-token',
  });

  const decoded = await decode({
    token: sessionJWT,
    secret: process.env.NEXTAUTH_SECRET as string,
  });

  const accessToken = decoded?.accessToken as string;

  return accessToken;
}
