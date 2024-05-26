import { NextRequest, NextResponse } from 'next/server';
import { decode, getToken } from 'next-auth/jwt';
import { apiWrapper } from '@/utils/apiWrapper';
import { AlcoholsApi } from '../AlcholsApi';

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);

  if (search.includes('popular')) {
    const result = await apiWrapper(() => AlcoholsApi.getPopular());

    return NextResponse.json(result);
  }

  if (search.includes('region')) {
    const result = await apiWrapper(AlcoholsApi.getRegion);

    return NextResponse.json(result);
  }
}
