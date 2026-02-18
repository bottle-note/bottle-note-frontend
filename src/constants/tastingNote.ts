export const TASTING_AXES = [
  {
    key: 'smoky',
    label: 'Smoky',
    labelKo: '스모키',
    guide: '연기, 이탄, 숯',
  },
  {
    key: 'fruity',
    label: 'Fruity',
    labelKo: '과일',
    guide: '사과, 배, 건과, 열대과일',
  },
  {
    key: 'floral',
    label: 'Floral',
    labelKo: '꽃/허브',
    guide: '장미, 라벤더, 풀',
  },
  {
    key: 'sweet',
    label: 'Sweet',
    labelKo: '달콤함',
    guide: '바닐라, 캐러멜, 꿀',
  },
  {
    key: 'spicy',
    label: 'Spicy',
    labelKo: '향신료',
    guide: '후추, 시나몬, 생강',
  },
  {
    key: 'body',
    label: 'Body',
    labelKo: '바디감',
    guide: '가볍고 부드러운 ~ 묵직하고 강렬한',
  },
] as const;

export type TastingAxisKey = (typeof TASTING_AXES)[number]['key'];

export type TastingNoteValues = Record<TastingAxisKey, number>;

export const TASTING_MAX_VALUE = 5;

export const DEFAULT_TASTING_NOTE: TastingNoteValues = {
  smoky: 0,
  fruity: 0,
  floral: 0,
  sweet: 0,
  spicy: 0,
  body: 0,
};

export const isTastingNoteEmpty = (note: TastingNoteValues | null): boolean => {
  if (!note) return true;
  return Object.values(note).every((v) => v === 0);
};
