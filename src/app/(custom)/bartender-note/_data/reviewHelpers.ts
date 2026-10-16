import { TAGS_LIMIT } from '@/constants/review';
import { TASTING_AXES } from '@/constants/tastingNote';
import { tastingTags } from './tastingTags';
import type { ReviewDraft } from '../_components/types';

export const noteKeywords: Record<string, string[]> = {
  '마신 방법': [
    '니트로 마셨다.',
    '온더락으로 마셨다.',
    '하이볼로 마셨다.',
    '물을 몇 방울 넣어 마셨다.',
  ],
  느낌: [
    '목넘김이 부드러웠다.',
    '알코올이 조금 튀었다.',
    '여운이 길게 남았다.',
    '생각보다 가벼웠다.',
    '생각보다 묵직했다.',
    '시간이 지나며 향이 열렸다.',
  ],
  상황: [
    '퇴근 후 한 잔.',
    '바에서 추천받아 마셨다.',
    '친구와 나눠 마셨다.',
    '선물 받은 병을 열었다.',
  ],
  한마디: [
    '또 마시고 싶다.',
    '가격 대비 만족스럽다.',
    '입문자에게 권하고 싶다.',
    '다른 사람에게도 추천해 볼 만하다.',
    '한 번이면 충분하다.',
  ],
};

export const npfFeel: Record<'nose' | 'palate' | 'finish', string[]> = {
  nose: [
    '은은하다',
    '진하게 올라온다',
    '알코올이 조금 튄다',
    '시간이 지나며 열린다',
    '물을 타니 열린다',
  ],
  palate: [
    '달다',
    '드라이하다',
    '부드럽다',
    '오일리하다',
    '스파이시하다',
    '가볍다',
    '묵직하다',
  ],
  finish: [
    '짧다',
    '적당하다',
    '길게 남는다',
    '스파이시하게 끝난다',
    '달콤하게 남는다',
    '스모키하게 남는다',
    '드라이하게 끝난다',
  ],
};

export function tagSentence(tag: string) {
  const special: Record<string, string> = {
    '긴 여운': '여운이 길었다.',
    '균형 잡힌': '균형이 잘 잡혀 있었다.',
    '강한 알코올': '알코올이 강했다.',
    크리미: '크리미했다.',
    오일리: '질감이 오일리했다.',
    스파이시: '스파이시했다.',
    스모키: '스모키했다.',
  };
  if (special[tag]) return special[tag];
  if (tag.endsWith('적인')) return `${tag.slice(0, -2)}적이었다.`;
  if (tag.endsWith('한')) return `${tag.slice(0, -1)}했다.`;
  if (tag.endsWith('운')) return `${tag.slice(0, -1)}웠다.`;
  return `${tag} 향이 났다.`;
}

export function searchTags(query: string, whiskeyTags: string[]) {
  const key = query.trim().replace(/\s+/g, '');
  if (!key) return whiskeyTags.slice(0, 10);
  return [...new Set([...whiskeyTags, ...tastingTags])]
    .filter((tag) => tag.replace(/\s+/g, '').includes(key))
    .sort(
      (a, b) =>
        a.replace(/\s+/g, '').indexOf(key) -
          b.replace(/\s+/g, '').indexOf(key) || a.length - b.length,
    )
    .slice(0, 12);
}

// 긴 표현을 먼저 찾아 겹치는 짧은 태그를 중복 추출하지 않는다.
export function extractTags(text: string) {
  const occupied: [number, number][] = [];
  const found: [number, string][] = [];
  [...tastingTags]
    .sort((a, b) => b.length - a.length)
    .forEach((tag) => {
      let at = -1;
      while ((at = text.indexOf(tag, at + 1)) >= 0) {
        const end = at + tag.length;
        if (
          tag.length === 1 &&
          (/[가-힣]/.test(text[at - 1] ?? ' ') ||
            !/[\s,.!?…·향맛의]/.test(text[end] ?? ' '))
        )
          continue;
        if (occupied.some(([start, stop]) => at < stop && start < end))
          continue;
        occupied.push([at, end]);
        found.push([at, tag]);
        break;
      }
    });
  return found.sort((a, b) => a[0] - b[0]).map((entry) => entry[1]);
}

const flavorWords = [
  ['스모키', '피트', '이탄', '연기', '숯', '훈연', '바닷바람'],
  [
    '과일',
    '사과',
    '배',
    '건과일',
    '베리',
    '시트러스',
    '레몬',
    '오렌지',
    '복숭아',
  ],
  ['꽃', '허브', '장미', '라벤더', '풀', '민트', '차', '솔잎'],
  ['달콤', '달다', '단맛', '바닐라', '캐러멜', '꿀', '설탕', '토피', '초콜릿'],
  ['향신료', '스파이스', '스파이시', '후추', '시나몬', '계피', '생강', '정향'],
];

export function flavorFromText(text: string) {
  const hits: string[] = [];
  const values = flavorWords.map((words) => {
    const found = words.filter((word) => text.includes(word));
    hits.push(...found.slice(0, 2));
    return found.length >= 3
      ? 4
      : found.length === 2
        ? 3
        : found.length === 1
          ? 2
          : 0;
  });
  const heavy = ['묵직', '오일리', '크리미', '풍부', '무겁'].find((word) =>
    text.includes(word),
  );
  const light = ['가볍', '깔끔', '산뜻'].find((word) => text.includes(word));
  values.push(heavy ? 4 : light ? 2 : 0);
  if (heavy) hits.push(heavy);
  if (light) hits.push(light);
  return {
    values: TASTING_AXES.map((_, index) => values[index]),
    hits: [...new Set(hits)],
  };
}

/** 리뷰 본문. 노즈·팔레트·피니시로 쓴 리뷰는 항목 이름을 붙여 한 줄씩 잇는다. */
export function getReviewText(review: ReviewDraft) {
  if (review.mode === 'quick') return review.text;
  return [
    review.nose && `노즈: ${review.nose}`,
    review.palate && `팔레트: ${review.palate}`,
    review.finish && `피니시: ${review.finish}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** 본문에서 찾은 태그와 직접 넣은 태그. 뺀 태그는 제외하고 최대 개수까지만 둔다. */
export function getReviewTags(review: ReviewDraft) {
  const found = extractTags(
    review.mode === 'detail'
      ? [review.nose, review.palate, review.finish].join(', ')
      : review.text,
  );
  return [...new Set([...found, ...review.tags])]
    .filter((tag) => !review.excludedTags.includes(tag))
    .slice(0, TAGS_LIMIT);
}
