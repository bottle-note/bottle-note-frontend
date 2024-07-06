export const CATEGORY_MENUS = {
  All: { kor: '전체', eng: 'All', link: 'all' },
  SingleMalt: { kor: '싱글몰트', eng: 'Single malt', link: 'singleMalt' },
  BlendedMalt: {
    kor: '블렌디드 몰트',
    eng: 'Blended malt',
    link: 'blendedMalt',
  },
  Blended: { kor: '블렌디드', eng: 'Blended', link: 'blended' },
  America: { kor: '아메리카(버번)', eng: 'America(Bourbon)', link: 'america' },
  Rye: { kor: '라이', eng: 'Rye', link: 'rye' },
  Other: { kor: '기타', eng: 'Other', link: 'other' },
} as const;

// NOTE: api 를 통해 조회가 가능한데 프론트에서 값을 가지고 있는게 맞는지? 고민 후 수정
export const REGIONS = [
  { regionId: '', korName: '전체', engName: 'All' },
  {
    regionId: 1,
    korName: '호주',
    engName: 'Australia',
  },
  {
    regionId: 2,
    korName: '핀란드',
    engName: 'Finland',
  },
  {
    regionId: 3,
    korName: '프랑스',
    engName: 'France',
  },
  {
    regionId: 4,
    korName: '타이완',
    engName: 'Taiwan',
  },
  {
    regionId: 5,
    korName: '캐나다',
    engName: 'Canada',
  },
  {
    regionId: 6,
    korName: '체코',
    engName: 'Czech Republic',
  },
  {
    regionId: 7,
    korName: '일본',
    engName: 'Japan',
  },
  {
    regionId: 8,
    korName: '인도',
    engName: 'India',
  },
  {
    regionId: 9,
    korName: '이스라엘',
    engName: 'Israel',
  },
  {
    regionId: 10,
    korName: '웨일즈',
    engName: 'Wales',
  },
  {
    regionId: 11,
    korName: '영국',
    engName: 'United Kingdom',
  },
  {
    regionId: 12,
    korName: '아일랜드',
    engName: 'Ireland',
  },
  {
    regionId: 13,
    korName: '아이슬란드',
    engName: 'Iceland',
  },
  {
    regionId: 14,
    korName: '스코틀랜드/캠벨타운',
    engName: 'Scotland/Campbeltown',
  },
  {
    regionId: 15,
    korName: '스코틀랜드/아일라',
    engName: 'Scotland/Islay',
  },
  {
    regionId: 16,
    korName: '스코틀랜드/스페이사이드 ',
    engName: 'Scotland/Speyside',
  },
  {
    regionId: 17,
    korName: '스코틀랜드/로우랜드',
    engName: 'Scotland/Lowlands',
  },
  {
    regionId: 18,
    korName: '스코틀랜드/기타섬',
    engName: 'Scotland/Islands',
  },
  {
    regionId: 19,
    korName: '스코틀랜드',
    engName: 'Scotland/',
  },
  {
    regionId: 20,
    korName: '스코트랜드/하이랜드',
    engName: 'Scotland/Highlands',
  },
  {
    regionId: 21,
    korName: '스위스',
    engName: 'Switzerland',
  },
  {
    regionId: 22,
    korName: '스웨덴',
    engName: 'Sweden',
  },
  {
    regionId: 23,
    korName: '미국',
    engName: 'United States',
  },
  {
    regionId: 24,
    korName: '독일',
    engName: 'Germany',
  },
  {
    regionId: 25,
    korName: '덴마크',
    engName: 'Denmark',
  },
  {
    regionId: 26,
    korName: '네덜란드',
    engName: 'Netherlands',
  },
] as const;
