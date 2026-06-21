import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type {
  CurationV2FeedItem,
  TastingEventFeedItem,
  TastingEventPayload,
} from '@/api/curation-v2/types';

export const curationV2Keys = {
  all: ['curation-v2'] as const,
  feed: (pageSize: number) =>
    [...curationV2Keys.all, 'feed', { pageSize }] as const,
  tastingEvents: (pageSize: number) =>
    [...curationV2Keys.feed(pageSize), 'tasting-events'] as const,
};

const isTastingEventPayload = (
  payload: CurationV2FeedItem['payload'],
): payload is TastingEventPayload => {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return false;
  }

  return (
    'eventDate' in payload &&
    'eventTime' in payload &&
    'barAddress' in payload &&
    'isRecruiting' in payload
  );
};

const isTastingEventFeedItem = (
  item: CurationV2FeedItem,
): item is TastingEventFeedItem => isTastingEventPayload(item.payload);

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
