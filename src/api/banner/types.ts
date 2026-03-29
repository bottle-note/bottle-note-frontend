export type BannerTextPosition = 'LT' | 'LB' | 'RT' | 'RB' | 'CENTER';
export type BannerType = 'SURVEY' | 'CURATION' | 'AD' | 'PARTNERSHIP';
export type MediaType = 'IMAGE' | 'VIDEO';

export interface Banner {
  id: number;
  name: string;
  nameFontColor: string;
  descriptionA: string;
  descriptionB: string;
  descriptionFontColor: string;
  imageUrl: string;
  textPosition: BannerTextPosition;
  targetUrl: string;
  isExternalUrl: boolean;
  mediaType: MediaType;
  bannerType: BannerType;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
}
