export const TASTING_AXES = [
  {
    key: 'smoky',
    label: 'Smoky',
    labelKo: '스모키',
    descriptor: '연기 · 이탄 · 숯',
    guide: '연기, 이탄, 숯',
    sliderHint: ['없음', '강렬'] as const,
  },
  {
    key: 'fruity',
    label: 'Fruity',
    labelKo: '과일',
    descriptor: '사과 · 배 · 열대과일',
    guide: '사과, 배, 건과, 열대과일',
    sliderHint: ['없음', '풍부'] as const,
  },
  {
    key: 'floral',
    label: 'Floral',
    labelKo: '꽃/허브',
    descriptor: '장미 · 라벤더 · 풀',
    guide: '장미, 라벤더, 풀',
    sliderHint: ['없음', '풍부'] as const,
  },
  {
    key: 'sweet',
    label: 'Sweet',
    labelKo: '달콤함',
    descriptor: '바닐라 · 캐러멜 · 꿀',
    guide: '바닐라, 캐러멜, 꿀',
    sliderHint: ['없음', '진함'] as const,
  },
  {
    key: 'spicy',
    label: 'Spicy',
    labelKo: '향신료',
    descriptor: '후추 · 시나몬 · 생강',
    guide: '후추, 시나몬, 생강',
    sliderHint: ['없음', '강렬'] as const,
  },
  {
    key: 'body',
    label: 'Body',
    labelKo: '바디감',
    descriptor: '가벼움 ↔ 묵직함',
    guide: '가볍고 부드러운 ~ 묵직하고 강렬한',
    sliderHint: ['가벼움', '묵직'] as const,
  },
] as const;

export type TastingAxisKey = (typeof TASTING_AXES)[number]['key'];

export const TASTING_MAX_VALUE = 5;

/** 탭 시 표시되는 레벨 설명 (index = 0~5 단계) */
export const LEVEL_DESCRIPTIONS = [
  '느껴지지 않음',
  '살짝 느껴짐',
  '은은하게',
  '적당히',
  '꽤 강하게',
  '매우 강렬',
] as const;

/** 최고 점수가 다른 프로필도 0~5 단계로 환산한다. */
const toFiveLevel = (value: number, maxScore: number) =>
  Math.round((value / maxScore) * TASTING_MAX_VALUE);

export function getTastingLevelDescription(value: number, maxScore: number) {
  return LEVEL_DESCRIPTIONS[toFiveLevel(value, maxScore)];
}

/** 점수의 0~5 단계에 따른 햅틱 강도 매핑 */
export function getTastingHapticType(
  value: number,
  maxScore: number = TASTING_MAX_VALUE,
): 'light' | 'medium' | 'heavy' | null {
  const level = toFiveLevel(value, maxScore);
  if (level <= 0) return null;
  if (level >= 4) return 'heavy';
  if (level >= 2) return 'medium';
  return 'light';
}
