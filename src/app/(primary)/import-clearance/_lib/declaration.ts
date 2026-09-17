import type { MfdsAlcoholDetail, MfdsAlcoholListItem } from '@/api/mfds/types';

type Declaration = MfdsAlcoholListItem | MfdsAlcoholDetail;

/** 신고에 담긴 이름 중 가장 구체적인 것을 고른다. 모두 없으면 빈 문자열. */
export const declarationName = (item: Declaration) => ({
  korName:
    item.skuDisplayNameKo ??
    item.baseProductNameKo ??
    item.alcoholNameKo ??
    item.skuDisplayNameEn ??
    item.baseProductNameEn ??
    item.alcoholNameEn ??
    '',
  engName: item.skuDisplayNameEn ?? item.baseProductNameEn ?? '',
});

/** 처리일자는 수집 사이트 기준이며 null일 수 있다. */
export const processedDateText = (processedDate: string | null) =>
  processedDate ?? '미상';

export const PROCESSED_DATE_NOTICE =
  '처리일자는 수집 사이트에 표시된 날짜예요. 세관 통관 완료일과 다를 수 있어요.';
