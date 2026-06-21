import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import { tastingEventPayloadSchema } from '@/api/curation-v2/schema';
import type {
  CurationV2FeedItem,
  TastingEventFeedItem,
} from '@/api/curation-v2/types';

export const curationV2Keys = {
  all: ['curation-v2'] as const,
  feed: (pageSize: number) =>
    [...curationV2Keys.all, 'feed', { pageSize }] as const,
  tastingEvents: (pageSize: number) =>
    [...curationV2Keys.feed(pageSize), 'tasting-events'] as const,
};

const isTastingEventFeedItem = (
  item: CurationV2FeedItem,
): item is TastingEventFeedItem =>
  tastingEventPayloadSchema.safeParse(item.payload).success;

export const useTastingEventsQuery = (pageSize = 10) => {
  return useQuery({
    queryKey: curationV2Keys.tastingEvents(pageSize),
    queryFn: async (): Promise<TastingEventFeedItem[]> => {
      const response = await CurationV2Api.getFeed({ pageSize });
      return response.data.items.filter(isTastingEventFeedItem);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
