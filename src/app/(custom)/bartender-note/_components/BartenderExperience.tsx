'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import {
  alcoholDetailKeys,
  fetchAlcoholDetail,
  useAlcoholDetailQuery,
} from '@/queries/useAlcoholDetailQuery';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { ApiError } from '@/utils/ApiError';
import type { LoginTrigger } from '@/utils/analytics/types';
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
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import {
  reviewAlcoholFromDetails,
  reviewAlcoholFromWhiskey,
} from './reviewAlcohol';
import {
  getDialogue,
  getTalkCopy,
  type Notice,
  type TalkOrigin,
} from './dialogue';
import { getStepHeader } from './stepMeta';
import { useBartenderPicks } from './useBartenderPicks';
import { useBartenderJourney } from './useBartenderJourney';
import { useReviewDraft } from './useReviewDraft';
import { useReviewSubmit, ReviewSubmitError } from './useReviewSubmit';
import { useBartenderPose } from './useBartenderPose';
import { useTrackRecommendResult } from './useTrackRecommendResult';
import AlcoholTalk from './AlcoholTalk';
import { useAlcoholStory } from './useAlcoholStory';
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

/** 다음 질문이 이보다 늦으면 생각하는 자세를 보인다. */
const THINKING_DELAY_MS = 400;

/** 시나리오 응답을 읽는 단계. 질문과 추천 결과가 같은 조회를 쓴다. */
const isScenarioStep = (step: Step) =>
  step === 'scenario' || step === 'first-pick' || step === 'recommendations';

function LoadingStep() {
  return (
    <div role="status" className="flex flex-col gap-12">
      <span className="text-15">정보를 불러오고 있어요…</span>
      <SkeletonBase height={48} count={3} />
    </div>
  );
}

function StepError({
  onRetry,
  onRestart,
  versionConflict = false,
}: {
  onRetry: () => void;
  onRestart?: () => void;
  versionConflict?: boolean;
}) {
  return (
    <>
      <p role="alert" className="m-0 text-15 text-fg-neutral">
        {versionConflict
          ? '질문지가 업데이트됐어요. 처음부터 다시 시작해 주세요.'
          : '정보를 불러오지 못했어요. 다시 시도해 주세요.'}
      </p>
      {!versionConflict && <FlowAction onClick={onRetry}>다시 시도</FlowAction>}
      {onRestart && (
        <FlowTextAction onClick={onRestart}>처음부터 다시 시작</FlowTextAction>
      )}
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
  const { user, isLoggedIn, isLoading: authLoading } = useAuthSession();
  const { bridgeToLogin } = useLoginBridge();
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
  const queryClient = useQueryClient();
  const flow = useScenarioFlow({
    context,
    active: isScenarioStep(step),
    // 첫 잔은 술 상세로 그리므로, 1위 상세를 받아 둔 뒤 결과로 넘어가 로딩 화면을 거치지 않는다.
    // 실패해도 결과는 보여 주고, 첫 잔에서 다시 조회한다.
    prepareResult: async (result) => {
      const lead = result.candidates?.items[0];
      if (!lead) return;
      const alcoholId = String(lead.id);
      await queryClient.prefetchQuery({
        queryKey: alcoholDetailKeys.detail(alcoholId, user?.userId ?? null),
        queryFn: () => fetchAlcoholDetail(alcoholId),
        retry: false,
      });
    },
  });
  const firstPick = flow.query.data?.candidates?.items[0];
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
  const [resumeAfterLogin, setResumeAfterLogin] = useState<Step | null>(null);
  const picks = useBartenderPicks();
  const submit = useReviewSubmit();
  const bartender = useBartenderPose(step);
  const [thinking, setThinking] = useState(false);
  /** 고른 술을 바텐더가 건네고 이야기를 들려주는 단계. 추천 1위도 상세와 같은 화면이다. */
  const talkStep = step === 'first-pick' || step === 'detail';
  const requiresAlcohol =
    talkStep || (step.startsWith('review-') && step !== 'review-pick');
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
    flow.restore(saved.scenario.answers, saved.scenario.versionId);
    restoreReview(saved.review, saved.lastReviewMode);
    setSelection(saved.selection);
    setSituation(saved.situation);
    setCurationId(saved.curationId);
    setPostedReviewId(saved.postedReviewId);
    setResumeAfterLogin(saved.resumeAfterLogin ?? null);
    if (saved.stories) storyProgress.restore(saved.stories);
    tracking.restore(saved);
  }, []);

  // 다음 질문이 늦을 때만 바텐더가 생각하는 자세를 취한다. 빠르면 그대로 넘어간다
  useEffect(() => {
    if (!flow.pending) {
      setThinking(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setThinking(true), THINKING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [flow.pending]);

  useEffect(() => {
    if (!resumeAfterLogin || authLoading) return;
    if (isLoggedIn) move(resumeAfterLogin);
    setResumeAfterLogin(null);
  }, [resumeAfterLogin, authLoading, isLoggedIn]);

  useEffect(() => {
    if (
      step === 'scenario' &&
      flow.query.isSuccess &&
      flow.query.data.completed
    ) {
      setNotice(null);
      // 후보가 있으면 1위를 먼저 건넨다. 없으면 바로 빈 결과를 보여 준다.
      const lead = flow.query.data.candidates?.items[0];
      if (lead) setSelection({ id: lead.id, source: 'api' });
      moveStep(lead ? 'first-pick' : 'recommendations');
    }
  }, [step, flow.query.isSuccess, flow.query.data?.completed]);

  const leave = (resume?: Step) =>
    saveSnapshot({
      journey: { step, history },
      scenario: { context, answers: flow.answers, versionId: flow.versionId },
      review: { ...review, photos: [] },
      lastReviewMode,
      selection,
      situation,
      curationId,
      postedReviewId,
      stories: storyProgress.states,
      resumeAfterLogin: resume,
    });
  /** 비로그인이면 지금 화면을 남겨 두고 로그인 화면으로 보낸다. 로그인 후 resume 단계를 연다. */
  const requireLogin = (trigger: LoginTrigger, resume?: Step) => {
    if (isLoggedIn) return false;
    leave(resume);
    bridgeToLogin({ trigger });
    return true;
  };
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
    // 결과에서 질문으로 돌아갈 때만 마지막 답을 지운다. 목록 → 첫 잔은 답을 유지한다.
    if (previous === 'scenario' && isScenarioStep(step)) flow.back();
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
    resetStory();
  };
  const startScenario = () => {
    flow.reset();
    setSelection(null);
    tracking.reset();
    resetStory();
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
    if (!selected || requireLogin('picks')) return;
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
    if (entry === 'review' && requireLogin('review_write', next)) return;
    if (entry === 'picks' && requireLogin('picks', next)) return;
    move(next);
  };
  const writeReview = () => {
    if (requireLogin('review_write', 'review-mode')) return;
    move('review-mode');
  };

  const header = getStepHeader(step, {
    curationTitle: curation?.title,
    reviewMode: review.mode,
    // 다음 질문을 받는 동안은 방금 답한 질문의 번호를 둔다
    questionNumber: flow.answers.length + (flow.pending ? 0 : 1),
  });
  const scenarioStep = isScenarioStep(step);
  /** 시나리오 응답을 그대로 그리는 단계. 첫 잔은 고른 술의 상세로 그린다. */
  const scenarioView = scenarioStep && step !== 'first-pick';
  const scenarioData = flow.query.data;
  /** 결과에서 뒤로 가면 마지막 질문으로 돌아가는지. 목록 → 첫 잔은 단계만 되돌린다. */
  const backToQuestion =
    (step === 'scenario' && flow.canGoBack) ||
    (scenarioStep && previous === 'scenario');
  const stepLines = getDialogue({
    step,
    detailOrigin: previous,
    selected,
    curation,
    notice,
    hasCandidates: (scenarioData?.candidates?.totalCount ?? 0) > 0,
    firstPickName: firstPick?.name,
    pickCount: picks.isLoading ? undefined : picks.items.length,
  });
  const {
    story,
    reset: resetStory,
    persisted: storyProgress,
  } = useAlcoholStory({
    alcohol: selected,
    active: talkStep,
    greeting: stepLines[0],
  });
  const talkStory = talkStep ? story : null;
  const talkOrigin: TalkOrigin =
    step === 'first-pick'
      ? 'first-pick'
      : previous === 'recommendations' ||
          previous === 'favorites' ||
          previous === 'curation-list'
        ? previous
        : 'other';
  const dialogueLines =
    scenarioView && flow.query.isError && !flow.query.isFetchNextPageError
      ? ['질문을 불러오지 못했어요. 다시 시도해 주세요.']
      : scenarioView && !scenarioData
        ? ['질문을 준비하고 있어요.']
        : step === 'scenario' && scenarioData?.question
          ? [scenarioData.question.prompt]
          : talkStory && !notice
            ? talkStory.lines
            : stepLines;

  return (
    <BartenderFrame
      step={step}
      questionId={step === 'scenario' ? scenarioData?.question?.id : undefined}
      title={header.title}
      subtitle={header.subtitle}
      progress={header.progress}
      lines={dialogueLines}
      pose={
        talkStory?.pose ?? (thinking && scenarioView ? 'think' : bartender.pose)
      }
      onBack={
        previous || (step === 'scenario' && flow.canGoBack) ? back : undefined
      }
      backLabel={backToQuestion ? '이전 질문' : '이전 단계'}
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
          <FlowNavigation>
            <FlowTextAction onClick={() => start('picks', 'favorites')}>
              찜한 술 보기
            </FlowTextAction>
          </FlowNavigation>
        </>
      )}
      {scenarioView &&
        (flow.query.isError && !flow.query.isFetchNextPageError ? (
          <StepError
            onRetry={() => void flow.retry()}
            onRestart={startScenario}
            versionConflict={
              flow.query.error instanceof ApiError &&
              flow.query.error.response.status === 409
            }
          />
        ) : !scenarioData ? (
          <LoadingStep />
        ) : (
          <>
            {step === 'scenario' && scenarioData.question && (
              <ScenarioQuestionView
                key={scenarioData.question.id}
                question={scenarioData.question}
                disabled={!flow.canAnswer}
                pendingAnswer={flow.pendingAnswer}
                onAnswer={flow.answer}
              />
            )}
            {step === 'recommendations' &&
              scenarioData.completed &&
              scenarioData.candidates && (
                <ScenarioCandidateList
                  candidates={scenarioData.candidates}
                  onChoose={(id) => chooseAlcohol({ id, source: 'api' })}
                  home={home}
                  loadMore={() => void flow.query.fetchNextPage()}
                  loadingMore={flow.query.isFetchingNextPage}
                  loadMoreError={flow.query.isFetchNextPageError}
                />
              )}
          </>
        ))}
      {step === 'favorites' && picks.isLoading && <LoadingStep />}
      {isCandidateStep(step) && !(step === 'favorites' && picks.isLoading) && (
        <CandidateList
          step={step}
          curation={curation}
          whiskies={whiskies}
          pickedItems={picks.items}
          hasMorePicks={picks.hasMore}
          onChoose={chooseAlcohol}
          move={move}
          home={home}
          onLeave={() => leave()}
          onStartScenario={startScenario}
        />
      )}
      {requiresAlcohol &&
        !selected &&
        (alcoholQuery.isError ? (
          <StepError onRetry={() => void alcoholQuery.refetch()} />
        ) : (
          <LoadingStep />
        ))}
      {talkStep && selected && (
        <AlcoholTalk
          key={`${selection?.source}:${selected.id}`}
          alcohol={selected}
          copy={getTalkCopy(talkOrigin, curation?.title)}
          story={talkStory}
          onShowOthers={
            step === 'first-pick'
              ? (scenarioData?.candidates?.items.length ?? 0) > 1 ||
                scenarioData?.candidates?.nextCursor
                ? () => {
                    trackGA4Event('bartender_show_other_candidates');
                    move('recommendations');
                  }
                : undefined
              : back
          }
          isPicked={picks.isPicked(selected.id)}
          isTogglingPick={picks.isToggling}
          onTogglePick={() => void toggleFavorite()}
          onWriteReview={writeReview}
          onLeave={openAlcoholPage}
          home={home}
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
