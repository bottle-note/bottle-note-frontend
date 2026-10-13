'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { OptionList, FlowAction } from './FlowControls';
import BartenderFrame from './BartenderFrame';
import RecommendationFlow from './RecommendationFlow';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { getDialogue, type FavoriteNotice } from './dialogue';
import { getBackLabel, getStepHeader, getStepPose } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { prefersReducedMotion } from './prefersReducedMotion';
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

export default function BartenderExperience({
  whiskies,
  curations,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
}) {
  const { step, previous, move, back, restart } = useBartenderJourney();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [review, setReview] = useState<ReviewDraft>(initialReview);
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
  const [likedLookups, setLikedLookups] = useState<AlcoholLookupItem[]>([]);
  const [heldPose, setHeldPose] = useState<Pose | null>(null);
  const [favoriteNotice, setFavoriteNotice] = useState<FavoriteNotice | null>(
    null,
  );
  const [lastReviewMode, setLastReviewMode] =
    useState<ReviewDraft['mode']>('quick');
  const favoritePoseTimer = useRef<number | null>(null);
  const picks = useBartenderPicks();

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
      prefersReducedMotion() ? 0 : step === 'detail' ? 1700 : 3000,
    );
    return () => window.clearTimeout(timer);
  }, [step]);

  const home = () => {
    restart();
    setAnswers(initialAnswers);
    setLikedLookups([]);
    setReview(initialReview);
    setChosenId(null);
    setFavoriteNotice(null);
  };
  const updateAnswers = (value: Partial<Answers>) =>
    setAnswers((current) => ({ ...current, ...value }));
  const updateReview = (value: Partial<ReviewDraft>) =>
    setReview((current) => ({ ...current, ...value }));
  const chooseWhiskey = (whiskey: Whiskey, next: Step) => {
    setChosenId(whiskey.id);
    move(next);
  };
  const toggleFavorite = async (id: number) => {
    try {
      const picked = await picks.toggle(id);
      setFavoriteNotice(picked ? 'added' : 'removed');
    } catch {
      setFavoriteNotice('failed');
      return;
    }
    setHeldPose('smile');
    if (favoritePoseTimer.current !== null)
      window.clearTimeout(favoritePoseTimer.current);
    favoritePoseTimer.current = window.setTimeout(
      () => setHeldPose('serve'),
      prefersReducedMotion() ? 0 : 2600,
    );
  };

  const selected = whiskies.find((whiskey) => whiskey.id === chosenId);
  const curation = curations.find((item) => item.id === curationId);
  const pickedItems = picks.items.map((alcohol) => ({
    alcohol,
    whiskey: whiskies.find((whiskey) => whiskey.id === alcohol.alcoholId),
  }));
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
        ? []
        : step === 'similar' ||
            (step === 'recommendations' && exact.length === 0)
          ? similar.map(({ whiskey }) => whiskey)
          : exact.slice(0, 10).map(({ whiskey }) => whiskey);

  const header = getStepHeader(step, {
    curationTitle: curation?.title,
    reviewMode: review.mode,
  });
  const pose = heldPose ?? getStepPose(step);
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
  const dialogueLines = getDialogue({
    step,
    detailOrigin: previous,
    selected,
    curation,
    recommendationReason: recommendationMeta.get(chosenId ?? -1)?.why,
    favoriteNotice,
    exactCount: exact.length,
    similarCount: similar.length,
    level: answers.level,
    kind: answers.kind,
    likedCount: answers.likedIds.length,
    baseWhiskeyName: likedBase?.name ?? likedLookupBase?.korName,
  });

  return (
    <BartenderFrame
      step={step}
      title={header.title}
      subtitle={header.subtitle}
      progress={header.progress}
      lines={dialogueLines}
      pose={pose}
      onBack={previous ? back : undefined}
      backLabel={getBackLabel(step, previous)}
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
          {pickedItems.length > 0 && (
            <FlowAction onClick={() => move('favorites')}>
              {`찜한 술 ${pickedItems.length}${picks.hasMore ? '병 이상' : '병'} 볼게요`}
            </FlowAction>
          )}
        </>
      )}
      <RecommendationFlow
        step={step}
        answers={answers}
        updateAnswers={updateAnswers}
        whiskies={whiskies}
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
        pickedItems={pickedItems}
        hasMorePicks={picks.hasMore}
        isPicked={picks.isPicked}
        isTogglingPick={picks.isToggling}
        move={move}
        home={home}
        back={back}
        chooseWhiskey={chooseWhiskey}
        toggleFavorite={toggleFavorite}
        onSelectDetail={() => setFavoriteNotice(null)}
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
        whiskies={whiskies}
        move={move}
        home={home}
        chooseWhiskey={chooseWhiskey}
        lastReviewMode={lastReviewMode}
        setLastReviewMode={setLastReviewMode}
        postReview={() => restart('review-done')}
        startAnotherReview={() => {
          setReview({
            ...initialReview,
            place: review.place,
            mode: lastReviewMode,
          });
          setChosenId(null);
          restart('review-pick');
        }}
      />
    </BartenderFrame>
  );
}
