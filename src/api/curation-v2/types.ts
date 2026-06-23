// ============================================
// Curation V2 API - Request/Response Types
// ============================================

import type { PageableInfo } from '@/api/_shared/types';
import type { TastingEventPayload } from './schema';

export type { TastingEventAlcohol, TastingEventPayload } from './schema';

export interface RecommendedWhiskyPayloadItem {
  alcohol?: {
    alcoholId: number | null;
    korName: string;
    engName?: string;
    imageUrl?: string;
    regionName?: string;
    korCategory?: string;
    selectedTags?: string[];
  };
  comment?: string;
}

export type CurationV2Payload =
  | RecommendedWhiskyPayloadItem[]
  | TastingEventPayload
  | Record<string, unknown>
  | null;

export interface CurationV2FeedItem {
  id: number;
  name: string;
  description: string;
  coverImageUrl: string;
  imageUrls: string[];
  exposureStartDate: string | number[];
  exposureEndDate: string | number[];
  displayOrder: number;
  createAt: string | number[];
  specCode?: string;
  specName?: string;
  payload: CurationV2Payload;
}

export interface CurationV2FeedData {
  items: CurationV2FeedItem[];
  pageable: PageableInfo;
}

export type CurationV2DetailItem = CurationV2FeedItem;

export interface TastingEventFeedItem extends CurationV2FeedItem {
  payload: TastingEventPayload;
}

export interface TastingEventDetailItem extends CurationV2DetailItem {
  payload: TastingEventPayload;
}
