'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { OptionList, FlowAction } from './FlowControls';
import BartenderFrame from './BartenderFrame';
import RecommendationFlow from './RecommendationFlow';
import CandidateList, { getCandidates, isCandidateStep } from './CandidateList';
import WhiskeyDetail from './WhiskeyDetail';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { getDialogue, type Notice } from './dialogue';
import { getBackLabel, getStepHeader } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { useTasteRecommendation } from './useTasteRecommendation';
import { useReviewDraft } from './useReviewDraft';
import { useReviewSubmit } from './useReviewSubmit';
import { useBartenderPose } from './useBartenderPose';
import { saveSnapshot, takeSnapshot } from './bartenderSnapshot';
import type { Step } from './types';
import type { Curation, Situation, Whiskey } from '../_data/demo';

export default function BartenderExperience({
  whiskies,
  curations,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
}) {
  const router = useRouter();
  const journey = useBartenderJourney();
  const { step, previous } = journey;
  const taste = useTasteRecommendation(whiskies);
  const { answers, recommendation } = taste;
  const reviewDraft = useReviewDraft();
  const { review } = reviewDraft;
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
  const [postedReviewId, setPostedReviewId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const picks = useBartenderPicks();
  const submit = useReviewSubmit();
  const bartender = useBartenderPose(step);
  const selected = whiskies.find((whiskey) => whiskey.id === chosenId);

  // 다른 페이지에 다녀왔으면 보던 화면으로 돌아온다.
  useEffect(() => {
    const saved = takeSnapshot();
    if (!saved) return;
    journey.restore(saved.journey);
    taste.restore(saved);
    reviewDraft.restore(saved.review, saved.lastReviewMode);
    setChosenId(saved.chosenId);
    setSituation(saved.situation);
    setCurationId(saved.curationId);
    setPostedReviewId(saved.postedReviewId);
  }, []);
  /** 바텐더 노트 밖으로 나가기 직전에 지금 화면을 남겨 둔다. */
  const leave = () => {
    saveSnapshot({
      journey: { step, history: journey.history },
      answers,
      likedLookups: taste.likedLookups,
      review: { ...review, photos: [] },
      lastReviewMode: reviewDraft.lastMode,
      chosenId,
      situation,
      curationId,
      postedReviewId,
    });
  };

  // 바텐더의 알림 대사는 다른 단계로 넘어가면 사라진다.
  const move = (next: Step) => {
    setNotice(null);
    journey.move(next);
  };
  const back = () => {
    setNotice(null);
    journey.back();
  };
  const restart = (next?: Step) => {
    setNotice(null);
    journey.restart(next);
  };

  const home = () => {
    restart();
    taste.reset();
    reviewDraft.reset();
    setChosenId(null);
  };
  const chooseWhiskey = (whiskey: Whiskey, next: Step) => {
    setChosenId(whiskey.id);
    move(next);
  };
  const toggleFavorite = async (id: number) => {
    try {
      const picked = await picks.toggle(id);
      setNotice(picked ? 'pick-added' : 'pick-removed');
    } catch {
      setNotice('pick-failed');
      return;
    }
    bartender.smile();
  };
  /** 리뷰가 저장되면 완료 화면으로, 저장하지 못하면 미리보기에 남아 다시 누르게 한다. */
  const postReview = async () => {
    if (!selected) return;
    setNotice(null);
    try {
      const { reviewId, ratingSaved } = await submit.mutateAsync({
        alcoholId: selected.id,
        review,
      });
      setPostedReviewId(reviewId);
      restart('review-done');
      if (!ratingSaved) setNotice('rating-failed');
    } catch {
      setNotice('review-failed');
    }
  };

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
  const dialogueLines = getDialogue({
    step,
    detailOrigin: previous,
    selected,
    curation,
    recommendationReason: recommendation.meta.get(chosenId ?? -1)?.why,
    notice,
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
      pose={bartender.pose}
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
          onChoose={(whiskey) => chooseWhiskey(whiskey, 'detail')}
          move={move}
          home={home}
          onLeave={leave}
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
          onLeave={leave}
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
        updateReview={reviewDraft.updateReview}
        selected={selected}
        whiskies={whiskies}
        move={move}
        home={home}
        chooseWhiskey={chooseWhiskey}
        lastReviewMode={reviewDraft.lastMode}
        chooseMode={reviewDraft.chooseMode}
        postReview={postReview}
        isPosting={submit.isPending}
        onViewPostedReview={() => {
          if (postedReviewId === null) return;
          leave();
          router.push(ROUTES.REVIEW.DETAIL(postedReviewId));
        }}
        startAnotherReview={() => {
          reviewDraft.startAnother();
          setChosenId(null);
          restart('review-pick');
        }}
      />
    </BartenderFrame>
  );
}
