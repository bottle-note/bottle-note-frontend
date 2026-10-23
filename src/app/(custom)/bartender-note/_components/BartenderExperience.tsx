'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { OptionList, FlowNavigation, FlowTextAction } from './FlowControls';
import BartenderFrame from './BartenderFrame';
import RecommendationFlow from './RecommendationFlow';
import CandidateList, { getCandidates, isCandidateStep } from './CandidateList';
import WhiskeyDetail from './WhiskeyDetail';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { reviewAlcoholFromWhiskey, type ReviewAlcohol } from './reviewAlcohol';
import { getDialogue, type Notice } from './dialogue';
import { getBackLabel, getStepHeader } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { useTasteRecommendation } from './useTasteRecommendation';
import { useReviewDraft } from './useReviewDraft';
import { useReviewSubmit, ReviewSubmitError } from './useReviewSubmit';
import { useBartenderPose } from './useBartenderPose';
import { useTrackRecommendResult } from './useTrackRecommendResult';
import { saveSnapshot, takeSnapshot } from './bartenderSnapshot';
import type { ReviewDraft, Step } from './types';
import type { Curation, Situation, Whiskey } from '../_data/demo';
import type { BartenderQuestionnaire } from '../_data/questionnaire';

/** 목록 단계별로 술을 고른 경로. */
const SELECT_SOURCE = {
  recommendations: 'taste',
  similar: 'taste',
  'curation-list': 'situation',
  favorites: 'picks',
} as const;

export default function BartenderExperience({
  whiskies,
  curations,
  questionnaire,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
  questionnaire: BartenderQuestionnaire;
}) {
  const router = useRouter();
  const {
    step,
    history,
    previous,
    move: moveStep,
    back: backStep,
    restart: restartJourney,
    restore: restoreJourney,
  } = useBartenderJourney();
  const {
    answers,
    likedLookups,
    recommendation,
    baseWhiskeyName,
    updateAnswers,
    rememberLookup,
    reset: resetTaste,
    restore: restoreTaste,
  } = useTasteRecommendation(whiskies);
  const {
    review,
    lastMode: lastReviewMode,
    updateReview,
    chooseMode,
    startAnother,
    reset: resetReview,
    restore: restoreReview,
  } = useReviewDraft();
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [reviewAlcohol, setReviewAlcohol] = useState<ReviewAlcohol | null>(
    null,
  );
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
  const [postedReviewId, setPostedReviewId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const picks = useBartenderPicks();
  const submit = useReviewSubmit();
  const bartender = useBartenderPose(step);
  const selected = whiskies.find((whiskey) => whiskey.id === chosenId);
  const selectedReviewAlcohol =
    reviewAlcohol ??
    (selected ? reviewAlcoholFromWhiskey(selected) : undefined);
  // 리뷰 작성 시작은 술 하나에 한 번만 보낸다.
  const reviewStartedFor = useRef<number | null>(null);

  // 다른 페이지에 다녀왔으면 보던 화면으로 돌아온다.
  useEffect(() => {
    const saved = takeSnapshot();
    if (!saved) return;
    restoreJourney(saved.journey);
    restoreTaste(saved);
    restoreReview(saved.review, saved.lastReviewMode);
    setChosenId(saved.chosenId);
    setReviewAlcohol(saved.reviewAlcohol ?? null);
    setSituation(saved.situation);
    setCurationId(saved.curationId);
    setPostedReviewId(saved.postedReviewId);
  }, []);
  /** 바텐더 노트 밖으로 나가기 직전에 지금 화면을 남겨 둔다. */
  const leave = () => {
    saveSnapshot({
      journey: { step, history },
      answers,
      likedLookups,
      review: { ...review, photos: [] },
      lastReviewMode,
      chosenId,
      reviewAlcohol,
      situation,
      curationId,
      postedReviewId,
    });
  };

  // 바텐더의 알림 대사는 다른 단계로 넘어가면 사라진다.
  const move = (next: Step) => {
    setNotice(null);
    moveStep(next);
  };
  const back = () => {
    setNotice(null);
    backStep();
  };
  const restart = (next?: Step) => {
    setNotice(null);
    restartJourney(next);
  };

  const home = () => {
    restart();
    resetTaste();
    resetReview();
    setChosenId(null);
    setReviewAlcohol(null);
    reviewStartedFor.current = null;
  };
  const chooseWhiskey = (whiskey: Whiskey, next: Step) => {
    setChosenId(whiskey.id);
    setReviewAlcohol(null);
    move(next);
  };
  const toggleFavorite = async (id: number) => {
    trackGA4Event('add_to_picks', {
      alcohol_id: String(id),
      alcohol_name: selected?.name ?? '',
      action: picks.isPicked(id) ? 'remove' : 'add',
      source: 'bartender_note',
    });
    try {
      const picked = await picks.toggle(id);
      setNotice(picked ? 'pick-added' : 'pick-removed');
    } catch {
      setNotice('pick-failed');
      return;
    }
    bartender.smile();
  };
  const chooseReviewMode = (mode: ReviewDraft['mode']) => {
    chooseMode(mode);
    if (
      !selectedReviewAlcohol ||
      reviewStartedFor.current === selectedReviewAlcohol.id
    )
      return;
    reviewStartedFor.current = selectedReviewAlcohol.id;
    trackGA4Event('write_review_start', {
      alcohol_id: String(selectedReviewAlcohol.id),
      source: 'bartender_note',
    });
  };
  /** 리뷰가 저장되면 완료 화면으로, 저장하지 못하면 미리보기에 남아 다시 누르게 한다. */
  const postReview = async () => {
    if (!selectedReviewAlcohol) return;
    const alcoholId = String(selectedReviewAlcohol.id);
    setNotice(null);
    try {
      const { reviewId, ratingSaved } = await submit.mutateAsync({
        alcoholId: selectedReviewAlcohol.id,
        review,
      });
      trackGA4Event('write_review_complete', {
        alcohol_id: alcoholId,
        source: 'bartender_note',
      });
      if (!ratingSaved)
        trackGA4Event('write_review_failed', {
          alcohol_id: alcoholId,
          failure_type: 'rating_save',
          source: 'bartender_note',
        });
      reviewStartedFor.current = null;
      setPostedReviewId(reviewId);
      restart('review-done');
      if (!ratingSaved) setNotice('rating-failed');
    } catch (error) {
      trackGA4Event('write_review_failed', {
        alcohol_id: alcoholId,
        failure_type:
          error instanceof ReviewSubmitError ? error.stage : 'review_save',
        source: 'bartender_note',
      });
      setNotice('review-failed');
    }
  };
  /** 실제 술 상세 페이지로 나간다. 돌아오면 지금 화면을 이어 본다. */
  const openAlcoholPage = (alcoholId: number, source: 'detail' | 'picks') => {
    trackGA4Event('bartender_open_alcohol_page', {
      alcohol_id: String(alcoholId),
      source,
    });
    leave();
  };
  const start = (
    entry: 'recommend' | 'situation' | 'review' | 'picks',
    next: Step,
  ) => {
    trackGA4Event('bartender_start', { entry });
    move(next);
  };

  const curation = curations.find((item) => item.id === curationId);
  const pickedItems = picks.items.map((alcohol) => ({
    alcohol,
    whiskey: whiskies.find((whiskey) => whiskey.id === alcohol.alcoholId),
  }));
  const { exact, similar } = recommendation;
  useTrackRecommendResult({
    step,
    answers,
    exactCount: exact.length,
    similarCount: similar.length,
    curationId,
    situation,
  });

  const header = getStepHeader(step, {
    curationTitle: curation?.title,
    reviewMode: review.mode,
  });
  const dialogueLines = getDialogue({
    step,
    detailOrigin: previous,
    selected: selectedReviewAlcohol ?? selected,
    curation,
    recommendationReason: recommendation.meta.get(chosenId ?? -1)?.why,
    notice,
    exactCount: exact.length,
    similarCount: similar.length,
    level: answers.level,
    kind: answers.kind,
    likedCount: answers.likedIds.length,
    baseWhiskeyName,
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
      onClose={() => router.push(ROUTES.HOME)}
    >
      {step === 'intro' && (
        <>
          <OptionList
            items={[
              {
                title: '위스키 추천해 주세요',
                description: '몇 가지 여쭤보고 골라 드려요',
                action: () => start('recommend', 'level'),
              },
              {
                title: '상황에 맞게 추천해 주세요',
                description: '집 · 바 · 계절 · 선물 큐레이션으로',
                action: () => start('situation', 'situation'),
              },
              {
                title: '바텐더님과 함께 리뷰를 쓸게요',
                description: '지금 드시는 술을 기록해 드려요',
                action: () => start('review', 'review-pick'),
              },
            ]}
          />
          {pickedItems.length > 0 && (
            <FlowNavigation>
              <FlowTextAction onClick={() => start('picks', 'favorites')}>
                {`찜한 술 ${pickedItems.length}${picks.hasMore ? '병 이상' : '병'} 보기`}
              </FlowTextAction>
            </FlowNavigation>
          )}
        </>
      )}
      <RecommendationFlow
        questionnaire={questionnaire}
        step={step}
        answers={answers}
        updateAnswers={updateAnswers}
        whiskies={whiskies}
        likedLookups={likedLookups}
        rememberLookup={rememberLookup}
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
            trackGA4Event('bartender_select_alcohol', {
              alcohol_id: String(whiskey.id),
              source: SELECT_SOURCE[step],
            });
            chooseWhiskey(whiskey, 'detail');
          }}
          move={move}
          home={home}
          onLeave={leave}
          onOpenAlcoholPage={(id) => openAlcoholPage(id, 'picks')}
        />
      )}
      {step === 'detail' && selected && (
        <WhiskeyDetail
          whiskey={selected}
          isPicked={picks.isPicked(selected.id)}
          isTogglingPick={picks.isToggling}
          onTogglePick={() => toggleFavorite(selected.id)}
          onWriteReview={() => move('review-mode')}
          onLeave={() => openAlcoholPage(selected.id, 'detail')}
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
        selected={selectedReviewAlcohol}
        move={move}
        home={home}
        onPickAlcohol={(alcohol) => {
          setChosenId(alcohol.id);
          setReviewAlcohol(alcohol);
          move('review-mode');
        }}
        lastReviewMode={lastReviewMode}
        chooseMode={chooseReviewMode}
        postReview={postReview}
        isPosting={submit.isPending}
        onViewPostedReview={() => {
          if (postedReviewId === null) return;
          leave();
          router.push(ROUTES.REVIEW.DETAIL(postedReviewId));
        }}
        startAnotherReview={() => {
          startAnother();
          setChosenId(null);
          setReviewAlcohol(null);
          reviewStartedFor.current = null;
          restart('review-pick');
        }}
      />
    </BartenderFrame>
  );
}
