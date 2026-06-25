import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import { curationV2Keys } from '@/queries/useTastingEventsQuery';

export const useCurationDetailQuery = (curationId?: string | number) => {
  return useQuery({
    queryKey: curationV2Keys.detail(curationId ?? ''),
    queryFn: async (): Promise<CurationV2DetailItem> => {
      const response = await CurationV2Api.getDetail(curationId as string);
      return response.data;
    },
    enabled: Boolean(curationId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
