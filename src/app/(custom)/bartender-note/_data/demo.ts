export type Whiskey = {
  id: number;
  name: string;
  category: '싱글 몰트' | '블렌디드' | '버번' | '라이';
  region: string;
  abv: number;
  rating: number | null;
  ratingCount?: number;
  reviewCount?: number;
  description?: string;
  tags: string[];
  bottlePrice: number | null;
  glassPrice: number | null;
};

// 화면 개발용 데이터. 추천 결과와 검색 목록은 서버 연동 시 교체한다.
export const demoWhiskies: Whiskey[] = [
  {
    id: 7007,
    name: '듀어스 12년',
    category: '블렌디드',
    region: '스코틀랜드',
    abv: 40,
    rating: 3.4,
    tags: ['바닐라', '꿀', '과일', '부드러운'],
    bottlePrice: 44000,
    glassPrice: 12000,
  },
  {
    id: 145,
    name: '제임슨 아이리시 위스키',
    category: '블렌디드',
    region: '아일랜드',
    abv: 40,
    rating: 4,
    tags: ['바닐라', '과일', '견과류'],
    bottlePrice: 41000,
    glassPrice: 13000,
  },
  {
    id: 575,
    name: '메이커스 마크',
    category: '버번',
    region: '미국',
    abv: 45,
    rating: 4,
    tags: ['바닐라', '캐러멜', '오크', '부드러운'],
    bottlePrice: 52000,
    glassPrice: 15000,
  },
  {
    id: 140,
    name: '조니워커 블랙',
    category: '블렌디드',
    region: '스코틀랜드',
    abv: 40,
    rating: 4,
    tags: ['스모키', '바닐라', '과일'],
    bottlePrice: 48000,
    glassPrice: 14000,
  },
  {
    id: 6330,
    name: '발베니 더블우드 12년',
    category: '싱글 몰트',
    region: '스페이사이드',
    abv: 40,
    rating: 4.2,
    tags: ['꿀', '셰리', '바닐라', '과일'],
    bottlePrice: 108000,
    glassPrice: 22000,
  },
  {
    id: 567,
    name: '글렌피딕 12년',
    category: '싱글 몰트',
    region: '스페이사이드',
    abv: 40,
    rating: 4.1,
    tags: ['사과', '배', '바닐라', '과일'],
    bottlePrice: 68000,
    glassPrice: 18000,
  },
  {
    id: 6273,
    name: '라프로익 10년',
    category: '싱글 몰트',
    region: '아일라',
    abv: 40,
    rating: 4.3,
    tags: ['피트', '스모키', '바닷바람'],
    bottlePrice: 89000,
    glassPrice: 22000,
  },
  {
    id: 9146,
    name: '아드벡 10년',
    category: '싱글 몰트',
    region: '아일라',
    abv: 46,
    rating: 4.4,
    tags: ['피트', '스모키', '레몬'],
    bottlePrice: 106000,
    glassPrice: 24000,
  },
  {
    id: 8200,
    name: '버팔로 트레이스',
    category: '버번',
    region: '미국',
    abv: 45,
    rating: 4.1,
    tags: ['바닐라', '캐러멜', '오크'],
    bottlePrice: 55000,
    glassPrice: 16000,
  },
  {
    id: 504,
    name: '불렛 라이',
    category: '라이',
    region: '미국',
    abv: 45,
    rating: null,
    tags: ['시나몬', '후추', '호밀', '스파이시'],
    bottlePrice: 60000,
    glassPrice: 15000,
  },
  {
    id: 406,
    name: '우드포드 리저브 라이',
    category: '라이',
    region: '미국',
    abv: 45.2,
    rating: null,
    tags: ['오크', '바닐라', '스파이시'],
    bottlePrice: 82000,
    glassPrice: 19000,
  },
  {
    id: 224,
    name: '몽키숄더',
    category: '블렌디드',
    region: '스코틀랜드',
    abv: 40,
    rating: 4,
    tags: ['바닐라', '꿀', '과일'],
    bottlePrice: 56000,
    glassPrice: 16000,
  },
];

export type Situation = 'home' | 'bar' | 'season' | 'gift';
export const situations: Record<
  Situation,
  { title: string; subtitle: string }
> = {
  home: {
    title: '집에서 마실 한 병',
    subtitle: '마트나 샵에서 살 한 병을 추천해 드려요',
  },
  bar: {
    title: '바에서 마실 한 잔',
    subtitle: '바에서 한 잔으로 마실 술을 추천해 드려요',
  },
  season: {
    title: '계절별 위스키 추천',
    subtitle: '계절에 어울리는 위스키를 추천해 드려요',
  },
  gift: {
    title: '선물용 위스키 추천',
    subtitle: '가격대별 선물용 위스키를 추천해 드려요',
  },
};

export type Curation = {
  id: number;
  situation: Situation;
  title: string;
  description: string;
  whiskeyIds: number[];
  unit?: 'glass' | 'bottle';
  start?: string;
  end?: string;
};

export const demoCurations: Curation[] = [
  {
    id: 61,
    situation: 'home',
    unit: 'bottle',
    title: '3~6만 원, 하이볼부터 니트까지',
    description: '처음엔 탄산, 다음엔 얼음, 마지막엔 그대로.',
    whiskeyIds: [7007, 145, 575, 140, 8200],
  },
  {
    id: 49,
    situation: 'bar',
    unit: 'glass',
    title: '스며드는 피트 15잔',
    description: '가벼운 스모키함부터 피트까지 천천히.',
    whiskeyIds: [140, 6273, 9146],
  },
  {
    id: 40,
    situation: 'season',
    unit: 'glass',
    title: '가을의 빛과 그림자를 닮은 위스키',
    description: '서늘한 날 천천히 마시기 좋은 술.',
    whiskeyIds: [6330, 567, 6273],
  },
  {
    id: 63,
    situation: 'gift',
    unit: 'bottle',
    title: '위스키 선물 4~6만 원',
    description: '고마운 마음을 전하기 좋은 병.',
    whiskeyIds: [7007, 575, 8200],
  },
  {
    id: 64,
    situation: 'gift',
    unit: 'bottle',
    title: '위스키 선물 7~13만 원',
    description: '조금 더 신경 쓴 선물을 고를 때.',
    whiskeyIds: [6330, 567, 9146],
  },
];
