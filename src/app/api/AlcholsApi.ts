import { AlcoholAPI, RegionApi } from '@/types/Alcohol';
import { ApiResponse } from '@/types/common';
import { decode, getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export const AlcoholsApi = {
  async getPopular(req: NextRequest) {
    // FIXME: 토큰 심는 로직 공통 로직으로 빼기
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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/popular/week`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ alcohols: AlcoholAPI[] }> =
      await response.json();

    const formattedData = result.data.alcohols.map((alcohol: AlcoholAPI) => {
      return {
        ...alcohol,
        path: `/search/${alcohol.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getRegion() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/regions`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<RegionApi[]> = await response.json();

    const regions = result.data.map((region) => {
      return {
        id: region.regionId,
        value: region.korName,
      };
    });

    regions.unshift({ id: -1, value: '국가(전체)' });

    return regions;
  },
};
