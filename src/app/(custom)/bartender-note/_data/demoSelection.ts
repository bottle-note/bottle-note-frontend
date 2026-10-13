import type { Whiskey } from './demo';
import type { Answers } from '../_components/types';

export type RecommendationMeta = {
  miss: string[];
  hit: string[];
  score: number;
  why: string;
};

export function matchesAxis(whiskey: Whiskey, axis: string) {
  if (!axis || axis === '상관없어요') return true;
  const names: Record<string, string[]> = {
    '피트·스모키': ['피트', '스모키'],
    '셰리·건과일': ['셰리', '건과일'],
    '바닐라·꿀': ['바닐라', '캐러멜', '꿀'],
    '과일·꽃': ['과일', '사과', '배', '꽃'],
    스파이시: ['스파이시', '시나몬', '후추'],
    '바닐라·캐러멜': ['바닐라', '캐러멜'],
    '스파이시·호밀': ['스파이시', '시나몬', '후추', '호밀'],
    '체리·과일': ['체리', '과일', '사과'],
    '진한 오크·가죽': ['오크', '가죽'],
    '부드러운·밀': ['부드러운', '밀', '크리미'],
  };
  return whiskey.tags.some((tag) => names[axis]?.includes(tag));
}

export function priceMatches(
  whiskey: Whiskey,
  unit: 'glass' | 'bottle',
  price: string,
) {
  if (!price || price === '상관없어요') return true;
  const amount = unit === 'glass' ? whiskey.glassPrice : whiskey.bottlePrice;
  if (amount === null) return false;
  const bounds: Record<string, [number, number]> =
    unit === 'glass'
      ? {
          '1.5만 원 이하': [0, 15000],
          '1.5~2.5만 원': [15001, 25000],
          '2.5~4만 원': [25001, 40000],
          '4만 원 이상': [40001, Infinity],
        }
      : {
          '5만 원 이하': [0, 50000],
          '5~10만 원': [50001, 100000],
          '10~20만 원': [100001, 200000],
          '20만 원 이상': [200001, Infinity],
        };
  const [min, max] = bounds[price] ?? [0, Infinity];
  return amount >= min && amount <= max;
}

// 서버 추천이 연결되기 전 화면 분기를 확인하기 위한 데모 평가다.
export function evaluateDemoWhiskey(
  whiskey: Whiskey,
  answers: Answers,
): RecommendationMeta {
  const miss: string[] = [];
  if (
    answers.kind &&
    answers.kind !== '상관없어요' &&
    whiskey.category !== answers.kind
  ) {
    miss.push(`${answers.kind} 아님`);
  }
  if (!matchesAxis(whiskey, answers.axis)) {
    miss.push(`${answers.axis.split('·')[0]} 약함`);
  }
  if (answers.abv.startsWith('43') && whiskey.abv > 43) miss.push('도수 높음');
  if (answers.abv.startsWith('44') && (whiskey.abv < 44 || whiskey.abv > 46)) {
    miss.push(whiskey.abv < 44 ? '도수 낮음' : '도수 높음');
  }
  if (answers.abv.startsWith('47') && whiskey.abv < 47) miss.push('도수 낮음');
  if (!priceMatches(whiskey, answers.unit, answers.price)) {
    miss.push(
      whiskey[answers.unit === 'glass' ? 'glassPrice' : 'bottlePrice'] === null
        ? '가격 정보 없음'
        : '예산 벗어남',
    );
  }
  const axisTags: Record<string, string[]> = {
    '피트·스모키': ['피트', '스모키'],
    '셰리·건과일': ['셰리', '건과일'],
    '바닐라·꿀': ['바닐라', '캐러멜', '꿀'],
    '과일·꽃': ['과일', '사과', '배', '꽃'],
    스파이시: ['스파이시', '시나몬', '후추'],
    '바닐라·캐러멜': ['바닐라', '캐러멜'],
    '스파이시·호밀': ['스파이시', '시나몬', '후추', '호밀'],
    '체리·과일': ['체리', '과일', '사과'],
    '진한 오크·가죽': ['오크', '가죽'],
    '부드러운·밀': ['부드러운', '밀', '크리미'],
  };
  const hit = whiskey.tags.filter((tag) =>
    axisTags[answers.axis]?.includes(tag),
  );
  const score =
    (whiskey.rating ?? 3.6) * 10 + hit.length * 8 - miss.length * 20;
  const deviation: Record<string, string> = {
    '도수 높음': '도수가 조금 높지만',
    '도수 낮음': '도수가 조금 낮지만',
    '가격 정보 없음': '가격은 확인이 필요하지만',
    '예산 벗어남': '예산과 조금 다르지만',
  };
  const why = miss.length
    ? `${deviation[miss[0]] ?? (miss[0].endsWith('아님') ? '고르신 종류는 아니지만' : '고르신 결은 약하지만')} ${hit.length ? `${hit.slice(0, 2).join('·')} 향이 있고 ` : ''}다른 조건은 가까운 병이에요.`
    : hit.length
      ? `${hit.slice(0, 2).join('·')} 향이 있어 고르신 결에 맞아요.`
      : `${whiskey.name}, 말씀하신 조건에 맞는 병이에요.`;
  return { miss, hit, score, why };
}

export type DemoRecommendation = {
  /** 모든 조건에 맞는 술. 점수가 높은 순서다. */
  exact: Whiskey[];
  /** 예산은 맞고 다른 조건이 가장 적게 어긋난 술. 점수가 높은 순서로 10병까지. */
  similar: Whiskey[];
  /** 술 id별 맞은 조건, 어긋난 조건, 추천 이유. */
  meta: Map<number, RecommendationMeta>;
};

// 서버 추천이 연결되기 전까지 결과와 조건 이탈 화면을 확인하기 위한 데모 추천이다.
export function recommendDemoWhiskies(
  whiskies: Whiskey[],
  answers: Answers,
): DemoRecommendation {
  const evaluated = whiskies
    .filter((whiskey) => !answers.likedIds.includes(whiskey.id))
    .map((whiskey) => ({
      whiskey,
      meta: evaluateDemoWhiskey(whiskey, answers),
    }));
  const byScore = (
    a: (typeof evaluated)[number],
    b: (typeof evaluated)[number],
  ) => b.meta.score - a.meta.score;

  const exact = evaluated
    .filter(({ meta }) => meta.miss.length === 0)
    .sort(byScore);
  const near = evaluated.filter(
    ({ meta }) =>
      meta.miss.length > 0 &&
      !meta.miss.some((label) => /예산|가격/.test(label)),
  );
  const fewestMisses = Math.min(...near.map(({ meta }) => meta.miss.length));
  const similar = near
    .filter(({ meta }) => meta.miss.length === fewestMisses)
    .sort(byScore)
    .slice(0, 10);

  return {
    exact: exact.map(({ whiskey }) => whiskey),
    similar: similar.map(({ whiskey }) => whiskey),
    meta: new Map(evaluated.map(({ whiskey, meta }) => [whiskey.id, meta])),
  };
}
