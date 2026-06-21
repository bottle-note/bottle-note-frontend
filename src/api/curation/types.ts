// ============================================
// Curation API - Request/Response Types
// ============================================

import type { CursorPaginationParams, PageableInfo } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type CurationListParams = CursorPaginationParams & {
  keyword?: string;
  alcoholId?: number;
};

// --------------- Response Types ---------------

export interface CurationItem {
  id: number;
  name: string;
  description: string;
  coverImageUrl: string;
  alcoholCount: number;
  displayOrder: number;
}

export interface CurationListData {
  items: CurationItem[];
  pageable: PageableInfo;
}

export interface CurationAlcoholItem {
  alcoholId: number;
  korName: string;
  engName: string;
  korCategoryName: string;
  engCategoryName: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  pickCount: number;
  isPicked: boolean;
}

export interface CurationAlcoholsData {
  items: CurationAlcoholItem[];
  pageable: PageableInfo;
}
