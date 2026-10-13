'use client';

import { useEffect, useRef, useState } from 'react';
import { OptionList, FlowAction } from './FlowControls';
import BartenderFrame from './BartenderFrame';
import RecommendationFlow from './RecommendationFlow';
import CandidateList, { getCandidates, isCandidateStep } from './CandidateList';
import WhiskeyDetail from './WhiskeyDetail';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { getDialogue, type FavoriteNotice } from './dialogue';
import { getBackLabel, getStepHeader, getStepPose } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { useTasteRecommendation } from './useTasteRecommendation';
import { prefersReducedMotion } from './prefersReducedMotion';
import { initialReview, type ReviewDraft, type Step } from './types';
import type { Pose } from './BarScene';
import type { Curation, Situation, Whiskey } from '../_data/demo';

export default function BartenderExperience({
  whiskies,
  curations,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
}) {
  const { step, previous, move, back, restart } = useBartenderJourney();
  const taste = useTasteRecommendation(whiskies);
  const { answers, recommendation } = taste;
  const [review, setReview] = useState<ReviewDraft>(initialReview);
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
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
    taste.reset();
    setReview(initialReview);
    setChosenId(null);
    setFavoriteNotice(null);
  };
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
  const { exact, similar } = recommendation;

  const header = getStepHeader(step, {
    curationTitle: curation?.title,
    reviewMode: review.mode,
  });
  const pose = heldPose ?? getStepPose(step);
  const dialogueLines = getDialogue({
    step,
    detailOrigin: previous,
    selected,
    curation,
    recommendationReason: recommendation.meta.get(chosenId ?? -1)?.why,
    favoriteNotice,
    exactCount: exact.length,
    similarCount: similar.length,
    level: answers.level,
    kind: answers.kind,
    likedCount: answers.likedIds.length,
    baseWhiskeyName: taste.baseWhiskeyName,
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
        updateAnswers={taste.updateAnswers}
        whiskies={whiskies}
        likedLookups={taste.likedLookups}
        rememberLookup={taste.rememberLookup}
        move={move}
      />
      {isCandidateStep(step) && (
        <CandidateList
          step={step}
          candidates={getCandidates(step, {
            recommendation,
            answers,
            curation,
            whiskies,
            pickedItems,
            hasMorePicks: picks.hasMore,
          })}
          curation={curation}
          onChoose={(whiskey) => {
            setFavoriteNotice(null);
            chooseWhiskey(whiskey, 'detail');
          }}
          move={move}
          home={home}
        />
      )}
      {step === 'detail' && selected && (
        <WhiskeyDetail
          whiskey={selected}
          isPicked={picks.isPicked(selected.id)}
          isTogglingPick={picks.isToggling}
          onTogglePick={() => toggleFavorite(selected.id)}
          onWriteReview={() => move('review-mode')}
          onBack={back}
        />
      )}
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
