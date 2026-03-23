import { useQuery } from '@tanstack/react-query';
import { BannerApi } from '@/api/banner/banner.api';
import type { Banner } from '@/api/banner/types';

export const bannerKeys = {
  all: ['banners'] as const,
  list: (limit: number) => [...bannerKeys.all, { limit }] as const,
};

export const useBannerQuery = (limit?: number) => {
  const normalizedLimit = limit ?? 10;

  return useQuery({
    queryKey: bannerKeys.list(normalizedLimit),
    queryFn: async (): Promise<Banner[]> => {
      const response = await BannerApi.getBanners(normalizedLimit);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
