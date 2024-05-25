import { NextRequest, NextResponse } from 'next/server';
import { decode, getToken } from 'next-auth/jwt';
import { apiWrapper } from '@/utils/apiWrapper';
import { AlcoholsApi } from '../AlcholsApi';
import { jwtDecode } from 'jwt-decode';

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);
  const token = await getToken({
    req: request,
    raw: true,
    cookieName: 'next-auth.session-token',
  });

  const decoded = await decode({
    token,
    secret: process.env.NEXTAUTH_SECRET as string,
  });

  console.log(decoded);

  if (search.includes('popular')) {
    const result = await apiWrapper(AlcoholsApi.getPopular);

    return NextResponse.json(result);
  }

  if (search.includes('region')) {
    const result = await apiWrapper(AlcoholsApi.getRegion);

    return NextResponse.json(result);
  }
}
