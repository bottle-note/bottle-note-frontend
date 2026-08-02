import {
  programFeedPayloadSchema,
  programPayloadSchema,
  recommendedWhiskyPayloadSchema,
  tastingEventPayloadSchema,
  whiskyPairingPayloadSchema,
} from './schema';
import type {
  CurationV2DetailItem,
  CurationV2FeedItem,
  ProgramDetailItem,
  ProgramFeedItem,
  RecommendedWhiskyDetailItem,
  TastingEventFeedItem,
  WhiskyPairingDetailItem,
  WhiskyPairingFeedItem,
} from './types';
import { CURATION_V2_SPEC_CODES } from './constants';

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

export const isRecommendedWhiskyDetailItem = (
  item: CurationV2DetailItem,
): item is RecommendedWhiskyDetailItem =>
  item.spec?.code === CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY &&
  recommendedWhiskyPayloadSchema.safeParse(item.payload).success;

export const isWhiskyPairingFeedItem = (
  item: CurationV2FeedItem,
): item is WhiskyPairingFeedItem =>
  whiskyPairingPayloadSchema.safeParse(item.payload).success;

export const isWhiskyPairingDetailItem = (
  item: CurationV2DetailItem,
): item is WhiskyPairingDetailItem =>
  item.spec?.code === CURATION_V2_SPEC_CODES.WHISKY_PAIRING &&
  whiskyPairingPayloadSchema.safeParse(item.payload).success;
