import { AlcoholAPI, RegionApi } from '@/types/Alcohol';
import { ApiResponse } from '@/types/common';

export const AlcoholsApi = {
  async getPopular() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/popular/week`,
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
