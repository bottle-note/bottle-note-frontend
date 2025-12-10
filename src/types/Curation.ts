export interface CurationItem {
  id: number;
  name: string;
  description: string;
  coverImageUrl: string;
  alcoholCount: number;
  displayOrder: number;
}

export interface CurationListParams {
  keyword?: string;
  alcoholId?: number;
  cursor?: number;
  pageSize?: number;
}

export interface CurationPageable {
  currentCursor: number;
  cursor: number;
  pageSize: number;
  hasNext: boolean;
}

export interface CurationListData {
  items: CurationItem[];
  pageable: CurationPageable;
}

export interface CurationAlcoholsParams {
  cursor?: number;
  pageSize?: number;
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
  pageable: CurationPageable;
}

export interface BannerItem {
  id: number;
  name: string;
  nameFontColor: string;
  descriptionA: string;
  descriptionB: string;
  descriptionFontColor: string;
  imageUrl: string;
  textPosition: 'LT' | 'LB' | 'RT' | 'RB' | 'CENTER';
  targetUrl: string;
  isExternalUrl: boolean;
  bannerType: string;
  sortOrder: number;
  startDate: number[] | null;
  endDate: number[] | null;
}

export type BannerListData = BannerItem[];
