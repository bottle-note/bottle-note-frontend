import { useQuery } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { RegionResponse } from '@/api/alcohol/types';

export const regionKeys = {
  all: ['regions'] as const,
};

const PLACEHOLDER: RegionResponse[] = [
  {
    regionId: 0,
    korName: '국가(전체)',
    engName: 'All',
    description: '',
    parentId: null,
  },
];

export const useRegionsQuery = () => {
  return useQuery({
    queryKey: regionKeys.all,
    queryFn: async (): Promise<RegionResponse[]> => {
      const response = await AlcoholsApi.getRegion();
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: PLACEHOLDER,
  });
};
