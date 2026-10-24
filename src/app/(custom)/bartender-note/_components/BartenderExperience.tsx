'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useAlcoholDetailQuery } from '@/queries/useAlcoholDetailQuery';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { trackGA4Event } from '@/utils/analytics/ga4';
import {
  OptionList,
  FlowAction,
  FlowNavigation,
  FlowTextAction,
} from './FlowControls';
import BartenderFrame from './BartenderFrame';
import ScenarioQuestionView from './ScenarioQuestionView';
import ScenarioCandidateList from './ScenarioCandidateList';
import CandidateList, { isCandidateStep } from './CandidateList';
import WhiskeyDetail from './WhiskeyDetail';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import {
  reviewAlcoholFromDetails,
  reviewAlcoholFromWhiskey,
} from './reviewAlcohol';
import { getDialogue, type Notice } from './dialogue';
import { getStepHeader } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { useReviewDraft } from './useReviewDraft';
import { useReviewSubmit, ReviewSubmitError } from './useReviewSubmit';
import { useBartenderPose } from './useBartenderPose';
import { useTrackRecommendResult } from './useTrackRecommendResult';
import { saveSnapshot, takeSnapshot } from './bartenderSnapshot';
import type { AlcoholSelection, ReviewDraft, Step } from './types';
import type { ScenarioContext } from '../_scenario/model';
import { useScenarioFlow } from '../_scenario/useScenarioFlow';
import type { Curation, Situation, Whiskey } from '../_data/demo';

const SELECT_SOURCE = {
  recommendations: 'taste',
  'curation-list': 'situation',
  favorites: 'picks',
} as const;

function LoadingStep() {
  return (
    <div role="status" className="flex flex-col gap-12">
      <span className="text-15">정보를 불러오고 있어요…</span>
      <SkeletonBase height={48} count={3} />
    </div>
  );
}

function StepError({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <p role="alert" className="m-0 text-15 text-fg-neutral">
        정보를 불러오지 못했어요. 다시 시도해 주세요.
      </p>
      <FlowAction onClick={onRetry}>다시 시도</FlowAction>
    </>
  );
}

export default function BartenderExperience({
  whiskies,
  curations,
  scenarioContext,
}: {
  whiskies: Whiskey[];
  curations: Curation[];
  scenarioContext: ScenarioContext;
}) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthSession();
  const {
    step,
    history,
    previous,
    move: moveStep,
    back: backStep,
    restart: restartJourney,
    restore: restoreJourney,
  } = useBartenderJourney();
  const [context, setContext] = useState(scenarioContext);
  const flow = useScenarioFlow({
    context,
    active: step === 'scenario' || step === 'recommendations',
  });
  const {
    review,
    lastMode: lastReviewMode,
    updateReview,
    chooseMode,
    startAnother,
    reset: resetReview,
    restore: restoreReview,
  } = useReviewDraft();
  const [selection, setSelection] = useState<AlcoholSelection | null>(null);
  const [situation, setSituation] = useState<Situation>('home');
  const [curationId, setCurationId] = useState<number | null>(null);
  const [postedReviewId, setPostedReviewId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const picks = useBartenderPicks();
  const submit = useReviewSubmit();
  const bartender = useBartenderPose(step);
  const requiresAlcohol =
    step === 'detail' || (step.startsWith('review-') && step !== 'review-pick');
  const alcoholQuery = useAlcoholDetailQuery({
    alcoholId: selection?.source === 'api' ? String(selection.id) : '',
    viewerId: user?.userId ?? null,
    enabled: requiresAlcohol && !authLoading,
  });
  const demo =
    selection?.source === 'demo'
      ? whiskies.find(({ id }) => id === selection.id)
      : undefined;
  const selected = demo
    ? reviewAlcoholFromWhiskey(demo)
    : alcoholQuery.data
      ? reviewAlcoholFromDetails(alcoholQuery.data)
      : undefined;
  const reviewStartedFor = useRef<number | null>(null);
  const curation = curations.find((item) => item.id === curationId);
  const tracking = useTrackRecommendResult({
    step,
    context,
    answers: flow.answers,
    response: flow.query.data,
    isSuccess: flow.query.isSuccess,
    curationId,
    situation,
  });

  useEffect(() => {
    const saved = takeSnapshot();
    if (!saved) return;
    restoreJourney(saved.journey);
    setContext(saved.scenario.context);
    flow.restore(saved.scenario.answers);
    restoreReview(saved.review, saved.lastReviewMode);
    setSelection(saved.selection);
    setSituation(saved.situation);
    setCurationId(saved.curationId);
    setPostedReviewId(saved.postedReviewId);
    tracking.restore(saved);
  }, []);

  useEffect(() => {
    if (
      step === 'scenario' &&
      flow.query.isSuccess &&
      flow.query.data.completed
    ) {
      setNotice(null);
      moveStep('recommendations');
    }
  }, [step, flow.query.isSuccess, flow.query.data?.completed]);

  const leave = () =>
    saveSnapshot({
      journey: { step, history },
      scenario: { context, answers: flow.answers },
      review: { ...review, photos: [] },
      lastReviewMode,
      selection,
      situation,
      curationId,
      postedReviewId,
    });
  const move = (next: Step) => {
    setNotice(null);
    moveStep(next);
  };
  const back = () => {
    setNotice(null);
    if (step === 'scenario' && flow.canGoBack) {
      flow.back();
      return;
    }
    if (step === 'recommendations') flow.back();
    backStep();
  };
  const restart = (next?: Step) => {
    setNotice(null);
    restartJourney(next);
  };
  const home = () => {
    restart();
    flow.reset();
    resetReview();
    setSelection(null);
    reviewStartedFor.current = null;
    tracking.reset();
  };
  const startScenario = () => {
    flow.reset();
    setSelection(null);
    tracking.reset();
    trackGA4Event('bartender_start', { entry: 'recommend' });
    move('scenario');
  };
  const chooseAlcohol = (next: AlcoholSelection) => {
    if (step === 'recommendations' || isCandidateStep(step)) {
      trackGA4Event('bartender_select_alcohol', {
        alcohol_id: String(next.id),
        source: SELECT_SOURCE[step],
      });
    }
    setSelection(next);
    move('detail');
  };
  const toggleFavorite = async () => {
    if (!selected) return;
    trackGA4Event('add_to_picks', {
      alcohol_id: String(selected.id),
      alcohol_name: selected.name,
      action: picks.isPicked(selected.id) ? 'remove' : 'add',
      source: 'bartender_note',
    });
    try {
      const picked = await picks.toggle(selected.id);
      setNotice(picked ? 'pick-added' : 'pick-removed');
    } catch {
      setNotice('pick-failed');
      return;
    }
    bartender.smile();
  };
  const chooseReviewMode = (mode: ReviewDraft['mode']) => {
    chooseMode(mode);
    if (!selected || reviewStartedFor.current === selected.id) return;
    reviewStartedFor.current = selected.id;
    trackGA4Event('write_review_start', {
      alcohol_id: String(selected.id),
      source: 'bartender_note',
    });
  };
  const postReview = async () => {
    if (!selected) return;
    const alcoholId = String(selected.id);
    setNotice(null);
    try {
      const { reviewId, ratingSaved } = await submit.mutateAsync({
        alcoholId: selected.id,
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
  const openAlcoholPage = () => {
    if (!selection) return;
    trackGA4Event('bartender_open_alcohol_page', {
      alcohol_id: String(selection.id),
      source: 'detail',
    });
    leave();
  };
  const start = (entry: 'situation' | 'review' | 'picks', next: Step) => {
    trackGA4Event('bartender_start', { entry });
    move(next);
  };

  const header = getStepHeader(step, {
    curationTitle: curation?.title,
    reviewMode: review.mode,
    questionNumber: flow.answers.length + 1,
  });
  const scenarioStep = step === 'scenario' || step === 'recommendations';
  const scenarioData = flow.query.data;
  const dialogueLines =
    scenarioStep && flow.query.isError
      ? ['질문을 불러오지 못했어요. 다시 시도해 주세요.']
      : scenarioStep && !scenarioData
        ? ['질문을 준비하고 있어요.']
        : step === 'scenario' && scenarioData?.question
          ? [scenarioData.question.prompt]
          : getDialogue({
              step,
              detailOrigin: previous,
              selected,
              curation,
              notice,
              candidateCount: scenarioData?.candidates?.totalCount ?? 0,
            });

  return (
    <BartenderFrame
      step={step}
      questionId={step === 'scenario' ? scenarioData?.question?.id : undefined}
      title={header.title}
      subtitle={header.subtitle}
      progress={header.progress}
      lines={dialogueLines}
      pose={bartender.pose}
      onBack={
        previous || (step === 'scenario' && flow.canGoBack) ? back : undefined
      }
      backLabel={
        (step === 'scenario' && flow.canGoBack) || step === 'recommendations'
          ? '이전 질문'
          : '이전 단계'
      }
      onClose={() => router.push(ROUTES.HOME)}
    >
      {step === 'intro' && (
        <>
          <OptionList
            items={[
              {
                title: '위스키 추천해 주세요',
                description: '몇 가지 여쭤보고 골라 드려요',
                action: startScenario,
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
          {picks.items.length > 0 && (
            <FlowNavigation>
              <FlowTextAction
                onClick={() => start('picks', 'favorites')}
              >{`찜한 술 ${picks.items.length}${picks.hasMore ? '병 이상' : '병'} 보기`}</FlowTextAction>
            </FlowNavigation>
          )}
        </>
      )}
      {scenarioStep &&
        (flow.query.isError ? (
          <StepError onRetry={() => void flow.retry()} />
        ) : !scenarioData ? (
          <LoadingStep />
        ) : (
          <>
            {step === 'scenario' && scenarioData.question && (
              <>
                {scenarioData.candidates && (
                  <p className="m-0 text-13 text-fg-neutral-muted">
                    현재 후보 {scenarioData.candidates.totalCount}병
                  </p>
                )}
                <ScenarioQuestionView
                  key={scenarioData.question.id}
                  question={scenarioData.question}
                  disabled={!flow.canAnswer}
                  onAnswer={flow.answer}
                />
              </>
            )}
            {step === 'recommendations' &&
              scenarioData.completed &&
              scenarioData.candidates && (
                <ScenarioCandidateList
                  candidates={scenarioData.candidates}
                  onChoose={(id) => chooseAlcohol({ id, source: 'api' })}
                  home={home}
                />
              )}
          </>
        ))}
      {isCandidateStep(step) && (
        <CandidateList
          step={step}
          curation={curation}
          whiskies={whiskies}
          pickedItems={picks.items}
          hasMorePicks={picks.hasMore}
          onChoose={chooseAlcohol}
          move={move}
          home={home}
          onLeave={leave}
        />
      )}
      {requiresAlcohol &&
        !selected &&
        (alcoholQuery.isError ? (
          <StepError onRetry={() => void alcoholQuery.refetch()} />
        ) : (
          <LoadingStep />
        ))}
      {step === 'detail' && selected && (
        <WhiskeyDetail
          key={`${selection?.source}:${selected.id}`}
          alcohol={selected}
          isPicked={picks.isPicked(selected.id)}
          isTogglingPick={picks.isToggling}
          onTogglePick={() => void toggleFavorite()}
          onWriteReview={() => move('review-mode')}
          onLeave={openAlcoholPage}
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
        onStartScenario={startScenario}
      />
      {(!requiresAlcohol || selected) && (
        <ReviewFlow
          step={step}
          review={review}
          updateReview={updateReview}
          selected={selected}
          move={move}
          home={home}
          onPickAlcohol={(id) => chooseAlcohol({ id, source: 'api' })}
          lastReviewMode={lastReviewMode}
          chooseMode={chooseReviewMode}
          postReview={postReview}
          isPosting={submit.isPending}
          onViewPostedReview={() => {
            if (postedReviewId !== null) {
              leave();
              router.push(ROUTES.REVIEW.DETAIL(postedReviewId));
            }
          }}
          startAnotherReview={() => {
            startAnother();
            setSelection(null);
            reviewStartedFor.current = null;
            restart('review-pick');
          }}
        />
      )}
    </BartenderFrame>
  );
}
