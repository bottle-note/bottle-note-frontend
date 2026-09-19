import type {
  MfdsAlcoholDetail,
  MfdsAlcoholListItem,
  MfdsAlcoholType,
} from '@/api/mfds/types';

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

/**
 * alcoholType 필터 표시용 한글 라벨. API는 이 키 자체(WHISKY 등)를 받고
 * 서버 내부에서 alcoholCategoryKo로 변환하므로, 여기 라벨은 화면 표시 전용이다.
 */
export const ALCOHOL_TYPE_OPTIONS: { id: MfdsAlcoholType; name: string }[] = [
  { id: 'WHISKY', name: '위스키' },
  { id: 'WINE', name: '와인' },
  { id: 'BEER', name: '맥주' },
  { id: 'RUM', name: '럼' },
  { id: 'VODKA', name: '보드카' },
  { id: 'GIN', name: '진' },
  { id: 'TEQUILA', name: '데킬라' },
  { id: 'BRANDY', name: '브랜디' },
  { id: 'ETC', name: '기타' },
];
