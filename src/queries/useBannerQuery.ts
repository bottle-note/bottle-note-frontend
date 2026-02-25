import { useQuery } from '@tanstack/react-query';
import { BannerApi } from '@/api/banner/banner.api';
import { FALLBACK_BANNERS } from '@/api/banner/banner.data';
import type { Banner } from '@/api/banner/types';

export const bannerKeys = {
  all: ['banners'] as const,
  list: (limit: number) => [...bannerKeys.all, { limit }] as const,
};

export const useBannerQuery = (limit?: number) => {
  const normalizedLimit = limit ?? 10;

  const query = useQuery({
    queryKey: bannerKeys.list(normalizedLimit),
    queryFn: async (): Promise<Banner[]> => {
      const response = await BannerApi.getBanners(normalizedLimit);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? (query.isError ? FALLBACK_BANNERS : undefined),
  };
};
