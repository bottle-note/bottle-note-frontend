export type BannerTextPosition = 'LT' | 'LB' | 'RT' | 'RB' | 'CENTER';
export type BannerType = 'SURVEY' | 'CURATION' | 'AD' | 'PARTNERSHIP';

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
  bannerType: BannerType;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
}
