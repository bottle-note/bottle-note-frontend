// ============================================
// Curation V2 API - Request/Response Types
// ============================================

import type { PageableInfo } from '@/api/_shared/types';
import type { RecommendedWhiskyPayload, TastingEventPayload } from './schema';

export type {
  CurationAlcohol,
  RecommendedWhiskyPayload,
  TastingEventAlcohol,
  TastingEventPayload,
} from './schema';

export type CurationV2Payload =
  | RecommendedWhiskyPayload
  | TastingEventPayload
  | Record<string, unknown>
  | null;

export interface CurationV2Spec {
  id: number;
  code: string;
  name: string;
  container: string;
  responseSpec: Record<string, unknown>;
}

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
  payload: CurationV2Payload;
}

export interface CurationV2FeedData {
  items: CurationV2FeedItem[];
  pageable: PageableInfo;
}

export interface CurationV2DetailItem extends CurationV2FeedItem {
  spec?: CurationV2Spec;
}

export interface TastingEventFeedItem extends CurationV2FeedItem {
  payload: TastingEventPayload;
}

export interface TastingEventDetailItem extends CurationV2DetailItem {
  payload: TastingEventPayload;
}

export interface RecommendedWhiskyFeedItem extends CurationV2FeedItem {
  payload: RecommendedWhiskyPayload;
}

export interface RecommendedWhiskyDetailItem extends CurationV2DetailItem {
  payload: RecommendedWhiskyPayload;
}
