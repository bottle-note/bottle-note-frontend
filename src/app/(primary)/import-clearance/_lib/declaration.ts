import type { MfdsAlcoholDetail, MfdsAlcoholListItem } from '@/api/mfds/types';

type Declaration = MfdsAlcoholListItem | MfdsAlcoholDetail;

/** 정제명(alcoholName)을 우선 사용하고, 없을 때만 기본 제품명(baseProductName)으로 fallback. */
export const declarationName = (item: Declaration) => ({
  korName: item.alcoholNameKo ?? item.baseProductNameKo ?? '',
  engName: item.alcoholNameEn ?? item.baseProductNameEn ?? '',
});
