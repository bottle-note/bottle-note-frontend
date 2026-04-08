import { useQuery } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { RegionResponse } from '@/api/alcohol/types';

export interface Region {
  regionId: number | '';
  korName: string;
  engName: string;
}

const ALL_REGION: Region = {
  regionId: '',
  korName: '국가(전체)',
  engName: 'All',
};

export const regionKeys = {
  all: ['regions'] as const,
};

function toRegions(data: RegionResponse[]): Region[] {
  const filtered = data
    .filter((r) => r.korName !== '-')
    .map((r) => ({
      regionId: r.regionId,
      korName: r.korName,
      engName: r.engName,
    }));

  return [ALL_REGION, ...filtered];
}

function toRegionOptions(regions: Region[]): { type: string; name: string }[] {
  return regions.map((r) => ({
    type: String(r.regionId),
    name: r.korName,
  }));
}

export const useRegionsQuery = () => {
  const query = useQuery({
    queryKey: regionKeys.all,
    queryFn: async (): Promise<Region[]> => {
      const response = await AlcoholsApi.getRegion();
      return toRegions(response.data);
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  const regions = query.data ?? [ALL_REGION];
  const regionOptions = toRegionOptions(regions);

  return {
    ...query,
    regions,
    regionOptions,
  };
};
