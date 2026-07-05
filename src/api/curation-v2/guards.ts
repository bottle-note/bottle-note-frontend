import {
  recommendedWhiskyPayloadSchema,
  tastingEventPayloadSchema,
} from './schema';
import type {
  CurationV2FeedItem,
  RecommendedWhiskyFeedItem,
  TastingEventFeedItem,
} from './types';

export const isTastingEventFeedItem = (
  item: CurationV2FeedItem,
): item is TastingEventFeedItem =>
  tastingEventPayloadSchema.safeParse(item.payload).success;

export const isRecommendedWhiskyFeedItem = (
  item: CurationV2FeedItem,
): item is RecommendedWhiskyFeedItem =>
  recommendedWhiskyPayloadSchema.safeParse(item.payload).success;
