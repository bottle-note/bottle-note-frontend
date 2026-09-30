import type { FormValues } from '@/types/Review';
import bottles from '../_data/bottles.json';

// These are presentation models, not an assumed API response contract.
export type Bottle = (typeof bottles)[number];
export type Step =
  | 'intro'
  | 'experience'
  | 'familiar'
  | 'kind'
  | 'flavor'
  | 'strength'
  | 'budget'
  | 'situation'
  | 'curations'
  | 'results'
  | 'bottle'
  | 'review-search'
  | 'review-rating'
  | 'review-tags'
  | 'review-text'
  | 'review-extras'
  | 'review-confirm'
  | 'review-complete';
export type Situation = 'home' | 'bar' | 'season' | 'gift';
export interface Screen {
  step: Step;
  bottleId?: number;
  situation?: Situation;
  curationId?: string;
  reviewSession?: number;
}
export interface Answers {
  experience: string;
  familiar: number[];
  kind: string;
  flavor: string;
  strength: string;
  unit: 'GLASS' | 'BOTTLE';
  budget: string;
}
export const initialAnswers: Answers = {
  experience: '',
  familiar: [],
  kind: '',
  flavor: '',
  strength: '',
  unit: 'GLASS',
  budget: '',
};
export const emptyReview = (place = ''): FormValues => ({
  review: '',
  status: 'PUBLIC',
  rating: 0,
  flavor_tags: [],
  price: null,
  price_type: 'GLASS',
  locationName: place,
  images: [],
});
export const BOTTLES = bottles;
export const findBottle = (id?: number) =>
  bottles.find((bottle) => bottle.id === id);

export const SITUATIONS = [
  {
    value: 'home',
    title: '집에서 마실 한 병',
    description: '하이볼부터 천천히 즐기는 한 잔까지',
  },
  {
    value: 'bar',
    title: '바에서 마실 한 잔',
    description: '오늘은 바텐더에게 한 잔 부탁해 볼까요',
  },
  {
    value: 'season',
    title: '계절에 어울리는 위스키',
    description: '지금의 공기와 잘 어울리는 한 잔',
  },
  {
    value: 'gift',
    title: '마음을 전할 선물',
    description: '받는 분을 떠올리며 골라 보세요',
  },
] as const;

export const CURATIONS = [
  {
    id: 'home-highball',
    situation: 'home',
    title: '집에서 가볍게, 하이볼 한 잔',
    description: '탄산과 얼음만 준비해 보세요.',
    ids: [145, 7007, 140, 8200],
  },
  {
    id: 'home-neat',
    situation: 'home',
    title: '천천히 음미하는 한 병',
    description: '오늘의 마지막 잔을 위한 선택.',
    ids: [462, 6330, 135],
  },
  {
    id: 'bar-first',
    situation: 'bar',
    title: '바에서 시작하는 위스키',
    description: '가벼운 과일향부터 차근차근.',
    ids: [462, 8200, 551, 6273],
  },
  {
    id: 'bar-peat',
    situation: 'bar',
    title: '스모키한 향을 따라',
    description: '은은한 연기에서 깊은 피트까지.',
    ids: [140, 135, 6273, 77],
  },
  {
    id: 'season-autumn',
    situation: 'season',
    title: '서늘한 저녁에 어울리는 한 잔',
    description: '오크와 건과일의 따뜻한 향.',
    ids: [6330, 7866, 135],
  },
  {
    id: 'gift-thanks',
    situation: 'gift',
    title: '고마운 마음을 담은 선물',
    description: '부담 없이 건네기 좋은 한 병.',
    ids: [7007, 551, 135],
  },
] as const;

export const QUESTIONS = {
  experience: {
    title: '위스키와 얼마나 친하신가요?',
    dialogue: '위스키는 얼마나 드셔 보셨어요?\n편하게 말씀해 주세요.',
    options: [
      {
        value: 'first',
        title: '이번이 처음이에요',
        description: '편하게 시작할 수 있는 한 잔부터',
      },
      {
        value: 'some',
        title: '몇 병 마셔 봤어요',
        description: '익숙한 맛과 새로운 맛 사이에서',
      },
      {
        value: 'often',
        title: '자주 마시는 편이에요',
        description: '아직 만나지 못한 한 잔을 찾아서',
      },
    ],
  },
  kind: {
    title: '어떤 종류가 끌리세요?',
    dialogue: '오늘은 어떤 종류로 드릴까요?\n정하지 않으셔도 괜찮아요.',
    options: [
      {
        value: 'malt',
        title: '싱글 몰트',
        description: '한 증류소의 개성을 느껴 보고 싶어요',
      },
      {
        value: 'blend',
        title: '블렌디드',
        description: '여러 원액이 어우러진 균형을 즐겨요',
      },
      {
        value: 'bourbon',
        title: '버번',
        description: '바닐라와 캐러멜의 달콤한 풍미',
      },
      { value: 'rye', title: '라이', description: '호밀에서 오는 알싸한 매력' },
      { value: 'any', title: '상관없어요', description: '바텐더님께 맡길게요' },
    ],
  },
  flavor: {
    title: '어떤 향과 맛을 좋아하세요?',
    dialogue: '마음이 가는 향을 골라 주세요.\n오늘의 취향이면 충분합니다.',
    options: [
      {
        value: 'peat',
        title: '피트·스모키',
        description: '모닥불과 바닷바람이 생각나는 향',
      },
      {
        value: 'sherry',
        title: '셰리·건과일',
        description: '건포도와 초콜릿처럼 짙은 풍미',
      },
      {
        value: 'sweet',
        title: '바닐라·꿀',
        description: '부드럽고 달콤한 한 모금',
      },
      {
        value: 'fruit',
        title: '과일·꽃',
        description: '싱그러운 과일과 은은한 꽃향기',
      },
      {
        value: 'spice',
        title: '스파이시',
        description: '후추와 시나몬의 알싸함',
      },
      {
        value: 'any',
        title: '상관없어요',
        description: '새로운 맛을 만나 보고 싶어요',
      },
    ],
  },
  strength: {
    title: '도수는 어느 정도가 좋으세요?',
    dialogue: '가볍게 즐길까요, 진하게 즐길까요?\n편하신 쪽으로 골라 주세요.',
    options: [
      {
        value: 'light',
        title: '43% 이하 · 편하게',
        description: '부담 없이 천천히 즐기고 싶어요',
      },
      {
        value: 'medium',
        title: '44~46% · 적당히',
        description: '풍미와 편안함의 균형이 좋아요',
      },
      {
        value: 'strong',
        title: '47% 이상 · 진하게',
        description: '선명한 향과 맛을 느끼고 싶어요',
      },
      {
        value: 'any',
        title: '상관없어요',
        description: '도수보다 맛이 궁금해요',
      },
    ],
  },
};

export const REVIEW_STEPS: Step[] = [
  'review-search',
  'review-rating',
  'review-tags',
  'review-text',
  'review-extras',
  'review-confirm',
  'review-complete',
];
export const RECOMMEND_STEPS: Step[] = [
  'experience',
  'familiar',
  'kind',
  'flavor',
  'strength',
  'budget',
];

export function screenCopy(screen: Screen): {
  title: string;
  pages: string[];
  progress: number;
} {
  const question = QUESTIONS[screen.step as keyof typeof QUESTIONS];
  if (question)
    return {
      title: question.title,
      pages: [question.dialogue],
      progress: (RECOMMEND_STEPS.indexOf(screen.step) + 1) / 6,
    };
  const copy: Partial<Record<Step, [string, string]>> = {
    intro: [
      '오늘은 어떻게 도와드릴까요?',
      '어서 오십시오. 편한 자리에 앉으세요.\n오늘은 어떻게 도와드릴까요?',
    ],
    familiar: [
      '괜찮았던 위스키가 있나요?',
      '이름을 알려 주시면 취향을 알아볼게요.\n아직 없으시면 건너뛰셔도 됩니다.',
    ],
    budget: [
      '예산은 어느 정도로 볼까요?',
      '한 잔으로 즐길지, 한 병으로 즐길지\n예산과 함께 알려 주세요.',
    ],
    situation: [
      '어떤 자리를 위한 한 잔인가요?',
      '집에서, 바에서, 혹은 소중한 선물로.\n어떤 자리를 생각하고 계세요?',
    ],
    curations: [
      '마음이 가는 이야기를 골라 주세요',
      '이런 큐레이션은 어떠세요?\n끌리는 이야기부터 만나 보세요.',
    ],
    results: [
      '오늘의 추천',
      '이런 위스키는 어떠신가요?\n마음이 가는 한 병을 골라 주세요.',
    ],
    bottle: [
      '오늘의 한 잔',
      '좋은 선택입니다.\n이 한 잔과 조금 더 가까워져 볼까요?',
    ],
    'review-search': [
      '어떤 위스키를 드시고 있나요?',
      '무엇을 드시고 계신가요?\n이름을 검색하거나 아래에서 골라 주세요.',
    ],
    'review-rating': [
      '이번 한 잔은 몇 점인가요?',
      '한 모금 천천히 즐겨 보세요.\n몇 점을 주고 싶으신가요?',
    ],
    'review-tags': [
      '어떤 향과 맛이 느껴졌나요?',
      '떠오르는 향과 맛을 골라 주세요.\n태그 없이 넘어가셔도 괜찮아요.',
    ],
    'review-text': [
      '한 잔의 느낌을 남겨 주세요',
      '마셔 보니 어떠셨어요?\n직접 느낀 한마디면 충분합니다.',
    ],
    'review-extras': [
      '어디서, 얼마에 즐기셨나요?',
      '장소와 가격, 사진도 남겨 볼까요?\n추가하지 않아도 괜찮습니다.',
    ],
    'review-confirm': [
      '기록을 함께 살펴볼까요?',
      '한 잔의 이야기가 모였네요.\n마지막으로 한번 살펴봐 주세요.',
    ],
    'review-complete': [
      '한 잔의 기록, 여기까지',
      '기록 미리보기를 마쳤습니다.\n다른 한 잔도 기록해 보시겠어요?',
    ],
  };
  const [title, text] = copy[screen.step] ?? copy.intro!;
  const index = REVIEW_STEPS.indexOf(screen.step);
  return {
    title,
    pages: [text],
    progress:
      index >= 0
        ? (index + 1) / REVIEW_STEPS.length
        : screen.step === 'intro'
          ? 0
          : screen.step === 'familiar'
            ? 2 / 6
            : screen.step === 'budget'
              ? 1
              : screen.step === 'situation'
                ? 1 / 3
                : screen.step === 'curations'
                  ? 2 / 3
                  : 1,
  };
}
