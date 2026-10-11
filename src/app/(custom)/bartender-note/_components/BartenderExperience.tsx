'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { OptionList, FlowAction } from './FlowControls';
import BartenderFrame from './BartenderFrame';
import RecommendationFlow from './RecommendationFlow';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { getDialogue } from './dialogue';
import {
  initialAnswers,
  initialReview,
  type Answers,
  type ReviewDraft,
  type Step,
} from './types';
import type { Pose } from './BarScene';
import { evaluateDemoWhiskey } from '../_data/demoSelection';
import type { Curation, Situation, Whiskey } from '../_data/demo';

const questionSteps: Step[] = [
  'level',
  'likes',
  'kind',
  'axis',
  'abv',
  'price',
];

export default function BartenderExperience({
  whiskies,
  curations,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [history, setHistory] = useState<Step[]>([]);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [review, setReview] = useState<ReviewDraft>(initialReview);
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedLookupQuery, setDebouncedLookupQuery] = useState('');
  const [likedLookups, setLikedLookups] = useState<AlcoholLookupItem[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [heldPose, setHeldPose] = useState<Pose | null>(null);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [lastReviewMode, setLastReviewMode] =
    useState<ReviewDraft['mode']>('quick');
  const favoritePoseTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedLookupQuery(query.trim().replace(/\s+/g, ' ')),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const lookup = useQuery({
    queryKey: ['bartender-note', 'alcohol-lookup', debouncedLookupQuery],
    queryFn: ({ signal }) => AlcoholsApi.lookup(debouncedLookupQuery, signal),
    enabled: step === 'likes' && debouncedLookupQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem('bn-bartender-fav') ?? '[]',
      );
      if (Array.isArray(saved))
        setFavorites(
          saved.filter((id): id is number => typeof id === 'number'),
        );
    } catch {
      /* 저장소를 쓸 수 없으면 이번 방문의 상태만 사용한다. */
    }
  }, []);

  useEffect(() => {
    if (favoritePoseTimer.current !== null) {
      window.clearTimeout(favoritePoseTimer.current);
      favoritePoseTimer.current = null;
    }
    if (step !== 'detail' && step !== 'review-done') {
      setHeldPose(null);
      return undefined;
    }
    setHeldPose(step === 'detail' ? 'pour' : 'toast');
    const timer = window.setTimeout(
      () => setHeldPose(step === 'detail' ? 'serve' : 'smile'),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : step === 'detail'
          ? 1700
          : 3000,
    );
    return () => window.clearTimeout(timer);
  }, [step]);

  const move = (next: Step) => {
    setHistory((current) => [...current, step]);
    setStep(next);
    setQuery('');
    setTagQuery('');
  };
  const back = () => {
    if (step === 'review-done') {
      home();
      return;
    }
    if (history.length === 0) {
      router.back();
      return;
    }
    setStep(history[history.length - 1]);
    setHistory((current) => current.slice(0, -1));
  };
  const home = () => {
    setHistory([]);
    setStep('intro');
    setAnswers(initialAnswers);
    setLikedLookups([]);
    setReview(initialReview);
    setChosenId(null);
    setQuery('');
    setTagQuery('');
    setFavoriteMessage('');
  };
  const updateAnswers = (value: Partial<Answers>) =>
    setAnswers((current) => ({ ...current, ...value }));
  const updateReview = (value: Partial<ReviewDraft>) =>
    setReview((current) => ({ ...current, ...value }));
  const chooseWhiskey = (whiskey: Whiskey, next: Step) => {
    setChosenId(whiskey.id);
    move(next);
  };
  const toggleFavorite = (id: number) => {
    const next = favorites.includes(id)
      ? favorites.filter((value) => value !== id)
      : [id, ...favorites];
    setFavorites(next);
    try {
      localStorage.setItem('bn-bartender-fav', JSON.stringify(next));
    } catch {
      /* 메모리 상태 유지 */
    }
    setFavoriteMessage(
      next.includes(id)
        ? '찜해 두었습니다. 처음 화면에서 다시 볼 수 있어요.'
        : '찜에서 뺐습니다.',
    );
    setHeldPose('smile');
    if (favoritePoseTimer.current !== null)
      window.clearTimeout(favoritePoseTimer.current);
    favoritePoseTimer.current = window.setTimeout(
      () => setHeldPose('serve'),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2600,
    );
  };

  const selected = whiskies.find((whiskey) => whiskey.id === chosenId);
  const curation = curations.find((item) => item.id === curationId);
  const availableFavorites = favorites.filter((id) =>
    whiskies.some((whiskey) => whiskey.id === id),
  );
  const detailOrigin = history[history.length - 1];
  // 서버 결과를 연결하기 전까지 결과와 조건 이탈 UI를 확인하는 데모 평가.
  const evaluated = useMemo(
    () =>
      whiskies
        .filter((whiskey) => !answers.likedIds.includes(whiskey.id))
        .map((whiskey) => ({
          whiskey,
          meta: evaluateDemoWhiskey(whiskey, answers),
        })),
    [answers, whiskies],
  );
  const exact = evaluated
    .filter(({ meta }) => meta.miss.length === 0)
    .sort((a, b) => b.meta.score - a.meta.score);
  const nearCandidates = evaluated.filter(
    ({ meta }) =>
      meta.miss.length > 0 &&
      !meta.miss.some((label) => /예산|가격/.test(label)),
  );
  const leastMisses = Math.min(
    ...nearCandidates.map(({ meta }) => meta.miss.length),
  );
  const similar = nearCandidates
    .filter(({ meta }) => meta.miss.length === leastMisses)
    .sort(
      (a, b) =>
        a.meta.miss.length - b.meta.miss.length || b.meta.score - a.meta.score,
    )
    .slice(0, 10);
  const recommendationMeta = new Map(
    evaluated.map(({ whiskey, meta }) => [whiskey.id, meta]),
  );
  const listed =
    step === 'curation-list'
      ? curation?.whiskeyIds
          .map((id) => whiskies.find((whiskey) => whiskey.id === id))
          .filter((item): item is Whiskey => Boolean(item)) ?? []
      : step === 'favorites'
        ? availableFavorites
            .map((id) => whiskies.find((whiskey) => whiskey.id === id))
            .filter((item): item is Whiskey => Boolean(item))
        : step === 'similar' ||
            (step === 'recommendations' && exact.length === 0)
          ? similar.map(({ whiskey }) => whiskey)
          : exact.slice(0, 10).map(({ whiskey }) => whiskey);
  const searchResults = whiskies
    .filter(
      (whiskey) =>
        whiskey.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        whiskey.category.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const key = query.trim().toLowerCase();
      if (!key) return 0;
      return (
        Number(b.name.toLowerCase().startsWith(key)) -
        Number(a.name.toLowerCase().startsWith(key))
      );
    });

  const questionProgress = questionSteps.indexOf(step);
  const reviewSteps: Step[] = [
    'review-mode',
    ...(review.mode === 'quick'
      ? (['review-text'] as Step[])
      : (['review-nose', 'review-palate', 'review-finish'] as Step[])),
    'review-graph',
    'review-photo',
    'review-rating',
    'review-where',
    'review-preview',
    'review-done',
    'review-posted-detail',
  ];
  const reviewProgress = reviewSteps.indexOf(step);
  const isReview = step.startsWith('review-');
  const reviewSubtitle: Partial<Record<Step, string>> = {
    'review-pick': '어떤 술인가요',
    'review-mode': '어떻게 남길까요',
    'review-text': '코멘트',
    'review-nose': '노즈 1 / 3',
    'review-palate': '팔레트 2 / 3',
    'review-finish': '피니시 3 / 3',
    'review-graph': '테이스팅 노트',
    'review-photo': '사진',
    'review-rating': '별점',
    'review-where': '장소',
    'review-preview': '다 됐습니다',
    'review-done': '등록 완료',
    'review-posted-detail': '내 리뷰',
  };
  const headerTitle = isReview
    ? '리뷰 쓰기'
    : step === 'situation' || step === 'curations' || step === 'curation-empty'
      ? '상황별 추천'
      : step === 'detail'
        ? '오늘의 한 잔'
        : step === 'favorites'
          ? '찜한 술'
          : step === 'recommendations' ||
              step === 'similar' ||
              step === 'curation-list'
            ? '바텐더 추천'
            : '바텐더 노트';
  const headerSubtitle =
    questionProgress >= 0
      ? `질문 ${questionProgress + 1} / 6`
      : isReview
        ? reviewSubtitle[step] ?? ''
        : step === 'curations'
          ? '상황별 큐레이션'
          : step === 'curation-list'
            ? curation?.title ?? ''
            : '';
  const progress =
    step === 'review-done' || step === 'review-posted-detail'
      ? 100
      : questionProgress >= 0
        ? ((questionProgress + 1) / questionSteps.length) * 100
        : reviewProgress >= 0
          ? ((reviewProgress + 1) / reviewSteps.length) * 100
          : step === 'recommendations' || step === 'curation-list'
            ? 100
            : 0;
  const pose: Pose =
    heldPose ??
    (step === 'intro'
      ? 'greet'
      : step === 'detail' || step === 'review-mode'
        ? 'serve'
        : step === 'review-nose'
          ? 'nose'
          : step === 'review-done'
            ? 'toast'
            : step === 'likes' ||
                step === 'situation' ||
                step === 'recommendations'
              ? 'think'
              : step === 'curation-empty'
                ? 'bow'
                : 'idle');
  const likedBase = whiskies.find(
    (whiskey) =>
      answers.likedIds.includes(whiskey.id) &&
      (answers.kind === '상관없어요' || whiskey.category === answers.kind),
  );
  const likedLookupBase = likedLookups.find(
    (item) =>
      answers.likedIds.includes(item.alcoholId) &&
      (answers.kind === '상관없어요' ||
        {
          SINGLE_MALT: '싱글 몰트',
          BLEND: '블렌디드',
          BLENDED_MALT: '블렌디드',
          BOURBON: '버번',
          RYE: '라이',
          OTHER: '',
        }[item.categoryGroup] === answers.kind),
  );
  const dialogueLines =
    favoriteMessage && step === 'detail'
      ? [favoriteMessage]
      : step === 'likes'
        ? [
            answers.level === '위스키 잘 몰라요'
              ? '드셔본 게 없으시면 그냥 넘어가셔도 됩니다.\n혹시 이름만 들어본 술이라도 있으신가요?'
              : '그중에 괜찮았던 게 있나요?\n이름을 적으시면 그 결에 가까운 쪽으로 찾아드려요.',
          ]
        : step === 'axis' && (likedBase || likedLookupBase)
          ? [
              `「${likedBase?.name ?? likedLookupBase?.korName}」을 기준으로 잡을게요.\n오늘은 어떤 결로 가실까요?`,
            ]
          : step === 'axis' &&
              answers.likedIds.length > 0 &&
              answers.kind !== '상관없어요'
            ? [
                `${answers.kind} 중에선 어떤 결로 드릴까요?\n한 가지만 잡으면 나머지는 제가 맞춰 드립니다.`,
              ]
            : getDialogue(
                step,
                exact.length,
                curation,
                selected,
                detailOrigin === 'curation-list' && selected
                  ? `「${curation?.title}」에 담긴 병이에요.\n${selected.tags.slice(0, 2).join('·')} 향이 중심입니다.`
                  : detailOrigin === 'recommendations' ||
                      detailOrigin === 'similar'
                    ? recommendationMeta.get(chosenId ?? -1)?.why
                    : undefined,
                similar.length,
              );

  return (
    <BartenderFrame
      step={step}
      title={headerTitle}
      subtitle={headerSubtitle}
      progress={progress}
      lines={dialogueLines}
      pose={pose}
      onBack={history.length > 0 ? back : undefined}
      backLabel={
        questionProgress >= 0 &&
        questionSteps.includes(history[history.length - 1])
          ? '이전 질문'
          : '이전 단계'
      }
      onClose={home}
    >
      {step === 'intro' && (
        <>
          <OptionList
            items={[
              {
                title: '위스키 추천해 주세요',
                description: '몇 가지 여쭤보고 골라 드려요',
                action: () => move('level'),
              },
              {
                title: '상황에 맞게 추천해 주세요',
                description: '집 · 바 · 계절 · 선물 큐레이션으로',
                action: () => move('situation'),
              },
              {
                title: '바텐더님과 함께 리뷰를 쓸게요',
                description: '지금 드시는 술을 기록해 드려요',
                action: () => move('review-pick'),
              },
            ]}
          />
          {availableFavorites.length > 0 && (
            <FlowAction onClick={() => move('favorites')}>
              찜한 술 {availableFavorites.length}병 볼게요
            </FlowAction>
          )}
        </>
      )}
      <RecommendationFlow
        step={step}
        answers={answers}
        updateAnswers={updateAnswers}
        whiskies={whiskies}
        query={query}
        setQuery={setQuery}
        searchResults={searchResults}
        lookupResults={
          query.trim().replace(/\s+/g, ' ') === debouncedLookupQuery
            ? lookup.data ?? []
            : []
        }
        lookupLoading={
          !!query.trim() &&
          (query.trim().replace(/\s+/g, ' ') !== debouncedLookupQuery ||
            lookup.isFetching)
        }
        lookupError={!!lookup.error}
        retryLookup={() => void lookup.refetch()}
        likedLookups={likedLookups}
        rememberLookup={(item) =>
          setLikedLookups((current) =>
            current.some((saved) => saved.alcoholId === item.alcoholId)
              ? current
              : [...current, item],
          )
        }
        listed={listed}
        exactCount={exact.length}
        similarCount={similar.length}
        recommendationMeta={recommendationMeta}
        selected={selected}
        curation={curation}
        favorites={favorites}
        move={move}
        home={home}
        back={back}
        chooseWhiskey={chooseWhiskey}
        toggleFavorite={toggleFavorite}
        onSelectDetail={() => setFavoriteMessage('')}
      />
      <CurationFlow
        step={step}
        curations={curations}
        situation={situation}
        setSituation={setSituation}
        setCurationId={setCurationId}
        move={move}
        home={home}
      />
      <ReviewFlow
        step={step}
        review={review}
        updateReview={updateReview}
        selected={selected}
        query={query}
        setQuery={setQuery}
        searchResults={searchResults}
        tagQuery={tagQuery}
        setTagQuery={setTagQuery}
        move={move}
        home={home}
        chooseWhiskey={chooseWhiskey}
        lastReviewMode={lastReviewMode}
        setLastReviewMode={setLastReviewMode}
        postReview={() => {
          setHistory([]);
          setStep('review-done');
        }}
        startAnotherReview={() => {
          setReview({
            ...initialReview,
            place: review.place,
            mode: lastReviewMode,
          });
          setChosenId(null);
          setHistory([]);
          setStep('review-pick');
          setQuery('');
        }}
      />
    </BartenderFrame>
  );
}
