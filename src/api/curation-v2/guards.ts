import {
  programFeedPayloadSchema,
  programPayloadSchema,
  recommendedWhiskyPayloadSchema,
  tastingEventPayloadSchema,
} from './schema';
import type {
  CurationV2DetailItem,
  CurationV2FeedItem,
  ProgramDetailItem,
  ProgramFeedItem,
  RecommendedWhiskyFeedItem,
  TastingEventFeedItem,
} from './types';

export const isTastingEventFeedItem = (
  item: CurationV2FeedItem,
): item is TastingEventFeedItem =>
  tastingEventPayloadSchema.safeParse(item.payload).success;

export const isProgramFeedItem = (
  item: CurationV2FeedItem,
): item is ProgramFeedItem =>
  programFeedPayloadSchema.safeParse(item.payload).success;

export const isProgramDetailItem = (
  item: CurationV2DetailItem,
): item is ProgramDetailItem =>
  programPayloadSchema.safeParse(item.payload).success;

export const isRecommendedWhiskyFeedItem = (
  item: CurationV2FeedItem,
): item is RecommendedWhiskyFeedItem =>
  recommendedWhiskyPayloadSchema.safeParse(item.payload).success;
