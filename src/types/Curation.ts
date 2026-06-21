import type { CursorPaginationParams, PageableInfo } from '@/api/_shared/types';

export interface CurationItem {
  id: number;
  name: string;
  description: string;
  coverImageUrl: string;
  alcoholCount: number;
  displayOrder: number;
}

export type CurationListParams = CursorPaginationParams & {
  keyword?: string;
  alcoholId?: number;
};

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
