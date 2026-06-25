import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import { curationV2Keys } from '@/queries/useTastingEventsQuery';

export const useCurationsQuery = (pageSize = 10) => {
  return useQuery({
    queryKey: curationV2Keys.curations(pageSize),
    queryFn: async (): Promise<CurationV2FeedItem[]> => {
      const response = await CurationV2Api.getFeed({ pageSize });

      return response.data.items.filter(
        (item) => !isTastingEventFeedItem(item),
      );
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
