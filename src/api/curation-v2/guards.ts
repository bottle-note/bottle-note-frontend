import { tastingEventPayloadSchema } from './schema';
import type { CurationV2FeedItem, TastingEventFeedItem } from './types';

export const isTastingEventFeedItem = (
  item: CurationV2FeedItem,
): item is TastingEventFeedItem =>
  tastingEventPayloadSchema.safeParse(item.payload).success;
