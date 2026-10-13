import { useMemo, useState } from 'react';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { initialAnswers, type Answers } from './types';
import { recommendDemoWhiskies } from '../_data/demoSelection';
import type { Whiskey } from '../_data/demo';

/** 서버 술 검색 결과의 종류를 취향 질문의 종류 이름으로 바꾼다. */
const LOOKUP_KIND: Record<AlcoholLookupItem['categoryGroup'], string> = {
  SINGLE_MALT: '싱글 몰트',
  BLEND: '블렌디드',
  BLENDED_MALT: '블렌디드',
  BOURBON: '버번',
  RYE: '라이',
  OTHER: '',
};

/** 취향 질문의 답과 그 답으로 고른 데모 추천. */
export function useTasteRecommendation(whiskies: Whiskey[]) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  // 서버 검색으로 고른 마셔본 술. 데모 목록에 없어도 이름을 보여 주려고 기억한다.
  const [likedLookups, setLikedLookups] = useState<AlcoholLookupItem[]>([]);
  const recommendation = useMemo(
    () => recommendDemoWhiskies(whiskies, answers),
    [whiskies, answers],
  );

  const kindMatches = (kind: string) =>
    answers.kind === '상관없어요' || kind === answers.kind;
  // 고른 종류와 같은 마셔본 술이 있으면 바텐더가 그 술을 기준으로 향을 묻는다.
  const baseWhiskeyName =
    whiskies.find(
      (whiskey) =>
        answers.likedIds.includes(whiskey.id) && kindMatches(whiskey.category),
    )?.name ??
    likedLookups.find(
      (item) =>
        answers.likedIds.includes(item.alcoholId) &&
        kindMatches(LOOKUP_KIND[item.categoryGroup]),
    )?.korName;

  const updateAnswers = (value: Partial<Answers>) =>
    setAnswers((current) => ({ ...current, ...value }));
  const rememberLookup = (item: AlcoholLookupItem) =>
    setLikedLookups((current) =>
      current.some((saved) => saved.alcoholId === item.alcoholId)
        ? current
        : [...current, item],
    );
  const reset = () => {
    setAnswers(initialAnswers);
    setLikedLookups([]);
  };
  const restore = (saved: {
    answers: Answers;
    likedLookups: AlcoholLookupItem[];
  }) => {
    setAnswers(saved.answers);
    setLikedLookups(saved.likedLookups);
  };

  return {
    answers,
    updateAnswers,
    likedLookups,
    rememberLookup,
    recommendation,
    baseWhiskeyName,
    reset,
    restore,
  };
}
