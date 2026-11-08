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
import PromptModal from '@/components/ui/Modal/PromptModal';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { ApiError } from '@/utils/ApiError';
import type { LoginTrigger, ReviewEntryFlow } from '@/utils/analytics/types';
import { useSimilarAlcohols } from '@/queries/useSimilarAlcohols';
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
import SimilarCandidateList from './SimilarCandidateList';
import type { SimilarEntry } from './similarEntry';
import CurationFlow from './CurationFlow';
import ReviewFlow from './ReviewFlow';
import { reviewAlcoholFromDetails } from './reviewAlcohol';
import {
  useBartenderCuration,
  useCurationChoices,
} from './useBartenderCurations';
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
import { useBartenderCampaign } from './useBartenderCampaign';
import AlcoholTalk from './AlcoholTalk';
import { useAlcoholStory } from './useAlcoholStory';
import { saveSnapshot, takeSnapshot } from './bartenderSnapshot';
import type { AlcoholSelection, ReviewDraft, Step } from './types';
import type { ScenarioAnswerValue, ScenarioContext } from '../_scenario/model';
import {
  isScenarioUnavailable,
  useScenarioFlow,
} from '../_scenario/useScenarioFlow';

const SELECT_SOURCE = {
  recommendations: 'taste',
  'curation-list': 'situation',
  favorites: 'picks',
  similar: 'similar',
} as const;

const CAMPAIGN_BY_ENTRY = {
  situation: 'curation',
  review: 'review',
  picks: null,
} as const;

const REVIEW_ENTRY_BY_ORIGIN: Record<TalkOrigin, ReviewEntryFlow> = {
  'first-pick': 'recommend',
  recommendations: 'recommend',
  'curation-list': 'curation',
  favorites: 'picks',
  similar: 'similar',
  other: 'direct',
};

/**
 * 비로그인 사용자가 로그인이 필요한 동작을 눌렀을 때 모달에 보여 줄 안내.
 * 게스트 게이트처럼 막는 말보다 로그인하면 얻는 것을 앞세운다.
 * 찜하기와 찜한 술 보기는 GA 트리거(picks)는 같고 문구만 다르다.
 */
const LOGIN_PROMPT = {
  review: {
    trigger: 'review_write',
    title: '지금 드신 술, 기록해 둘까요?',
    description: '로그인하면 쓰던 자리에서 바로 이어 쓸 수 있어요.',
    action: '로그인하고 기록하기',
  },
  pick: {
    trigger: 'picks',
    title: '마음에 든 술, 모아 둘까요?',
    description: '로그인하면 찜한 술을 언제든 다시 볼 수 있어요.',
    action: '로그인하고 찜하기',
  },
  pickList: {
    trigger: 'picks',
    title: '찜한 술, 한눈에 볼까요?',
    description: '로그인하면 찜한 술을 한곳에 모아 볼 수 있어요.',
    action: '로그인하고 찜한 술 보기',
  },
  /** 추천 첫 잔은 누구나 보고, 나머지 후보는 로그인 후에 보여 준다. */
  otherCandidates: {
    trigger: 'other_candidates',
    title: '다른 술도 골라 드릴까요?',
    description: '로그인하면 바텐더가 고른 술을 모두 볼 수 있어요.',
    action: '로그인하고 더 보기',
  },
} satisfies Record<
  string,
  { trigger: LoginTrigger; title: string; description: string; action: string }
>;
type LoginPromptKind = keyof typeof LOGIN_PROMPT;

/**
 * 로그인 화면이 돌아올 주소(returnTo)와 같은 모양의 지금 주소.
 * 로그인 연결은 검색어를 URLSearchParams로 다시 적어(공백 %20 → +) 보내므로 같은 방식으로 맞춘다.
 */
const currentUrl = () => {
  const query = new URLSearchParams(window.location.search).toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}`;
};

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

/** 처음 화면과 준비 중 안내가 같은 문구로 권하는 추천 방법. */
const CURATION_OPTION = {
  title: '큐레이션으로 추천해 주세요',
  description: '주제별로 모은 위스키에서 골라 드려요',
};
const REVIEW_OPTION = {
  title: '바텐더님과 함께 리뷰를 쓸게요',
  description: '지금 드시는 술을 기록해 드려요',
};

/** 질문 추천이 준비 중일 때. 다시 시도해도 같아서 다른 방법으로 안내한다. */
function ScenarioUnavailable({
  onCuration,
  onReview,
  home,
}: {
  onCuration: () => void;
  onReview: () => void;
  home: () => void;
}) {
  return (
    <>
      <OptionList
        items={[
          { ...CURATION_OPTION, action: onCuration },
          { ...REVIEW_OPTION, action: onReview },
        ]}
      />
      <FlowNavigation>
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
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
  scenarioContext,
  similarEntry = null,
}: {
  scenarioContext: ScenarioContext;
  /** 주류 상세에서 넘어왔을 때의 기준 위스키와 태그. 있으면 비슷한 위스키 목록부터 연다. */
  similarEntry?: SimilarEntry | null;
}) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuthSession();
  const { bridgeToLogin } = useLoginBridge();
  const journey = useBartenderJourney((to) => {
    // 기기·화면 뒤로 가기 모두 여기로 온다. 그 지점의 답 수로 질문을 맞춘다
    setNotice(null);
    flow.goTo(to.answers);
  });
  const { step, previous } = journey;
  const selection = journey.position.selection;
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
  const [curationId, setCurationId] = useState<number | null>(null);
  const [postedReviewId, setPostedReviewId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [resumeAfterLogin, setResumeAfterLogin] = useState<Step | null>(null);
  const [loginPrompt, setLoginPrompt] = useState<{
    kind: LoginPromptKind;
    resume?: Step;
  } | null>(null);
  // 기기 뒤로 가기 등으로 단계가 바뀌면 그 단계에서 띄운 로그인 안내도 닫는다
  useEffect(() => setLoginPrompt(null), [step]);
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
  const selected = alcoholQuery.data
    ? reviewAlcoholFromDetails(alcoholQuery.data)
    : undefined;
  const reviewStartedFor = useRef<number | null>(null);
  const curationChoices = useCurationChoices({ enabled: step === 'curations' });
  const curationDetail = useBartenderCuration(curationId);
  const curation = curationDetail.curation;
  /** 질문·결과를 보던 중 시나리오가 404였다. 미리 확인하기 전에 눌렀거나 진행 중에 게시가 내려간 경우다. */
  const scenarioClosed =
    isScenarioStep(step) &&
    step !== 'first-pick' &&
    flow.query.isError &&
    !flow.query.isFetchNextPageError &&
    isScenarioUnavailable(flow.query.error);
  const tracking = useTrackRecommendResult({
    step,
    context,
    answers: flow.answers,
    response: flow.query.data,
    isSuccess: flow.query.isSuccess,
    curationId,
    curationsEmpty: curationChoices.state === 'empty',
    scenarioUnavailable: scenarioClosed,
  });
  const campaign = useBartenderCampaign();
  const similar = useSimilarAlcohols(
    similarEntry?.alcoholId ?? 0,
    similarEntry?.tags ?? [],
  );
  const similarState = similar.isError
    ? 'error'
    : similar.isPending
      ? 'loading'
      : similar.data.length === 0
        ? 'empty'
        : 'ready';

  useEffect(() => {
    const saved = takeSnapshot();
    const { isNewVisit, started } = journey.init(
      saved?.journey,
      // 로그인하고 같은 주소로 돌아왔으면 비슷한 위스키 진입이 남아 있어도 보던 화면을 잇는다
      similarEntry && saved?.loginReturnTo !== currentUrl()
        ? 'similar'
        : undefined,
    );
    // 새로고침·로그인 왕복·술 상세 페이지 복귀는 새 진입이 아니다
    if (isNewVisit) campaign.view();
    // 주류 상세에서 새로 넘어왔다. 이전에 보던 화면은 이어 가지 않는다
    if (started) {
      trackGA4Event('bartender_start', { entry: 'similar' });
      return;
    }
    if (!saved) return;
    campaign.restore(saved.campaign, saved.reviewCampaign);
    setContext(saved.scenario.context);
    flow.restore(
      saved.scenario.answers,
      saved.scenario.versionId,
      saved.scenario.trail,
    );
    restoreReview(saved.review, saved.lastReviewMode);
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
      // 마지막 질문 자리를 결과로 바꿔, 결과에서 뒤로 가면 마지막 질문이 나온다.
      const lead = flow.query.data.candidates?.items[0];
      journey.replace(
        lead ? 'first-pick' : 'recommendations',
        lead ? { selection: { id: lead.id, source: 'api' } } : undefined,
      );
    }
  }, [step, flow.query.isSuccess, flow.query.data?.completed]);

  // 캠페인 완료: 추천은 첫 잔이 보이거나 빈 결과에 닿을 때, 큐레이션은 술 목록이 보일 때, 리뷰는 미리보기
  useEffect(() => {
    if (
      (step === 'first-pick' && selected) ||
      (step === 'recommendations' && flow.query.data?.completed)
    )
      campaign.reach('recommend', 'FINISH');
    if (step === 'curation-list' && curation)
      campaign.reach('curation', 'FINISH');
    if (step === 'review-preview') campaign.reach('review', 'FINISH');
  }, [step, !!selected, flow.query.data?.completed, !!curation]);

  // 추천·큐레이션 결과는 로그인한 사용자에게만 보낸다. 리뷰 시도와 독립적으로 유지한다
  const hasCandidates = (flow.query.data?.candidates?.totalCount ?? 0) > 0;
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    // 추천: 첫 잔 다음의 후보 목록. 비로그인은 로그인해야 이 목록을 본다
    if (step === 'recommendations' && hasCandidates)
      campaign.reach('recommend', 'RESULT');
    // 큐레이션: 고른 술의 상세
    if (step === 'detail' && selected) campaign.reach('curation', 'RESULT');
  }, [step, hasCandidates, !!selected, authLoading, isLoggedIn]);

  const leave = (resume?: Step, { forLogin = false } = {}) =>
    saveSnapshot({
      loginReturnTo: forLogin ? currentUrl() : undefined,
      journey: journey.journey,
      scenario: {
        context,
        answers: flow.answers,
        trail: flow.trail,
        versionId: flow.versionId,
      },
      review: { ...review, photos: [] },
      lastReviewMode,
      curationId,
      postedReviewId,
      stories: storyProgress.states,
      resumeAfterLogin: resume,
      campaign: campaign.current(),
      reviewCampaign: campaign.currentReview(),
    });
  // 새로고침해도 보던 단계에서 이어 가도록 페이지를 떠나기 직전에 남겨 둔다
  const leaveRef = useRef(leave);
  leaveRef.current = leave;
  useEffect(() => {
    const save = () => leaveRef.current();
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, []);
  /** 비로그인이면 로그인 안내 모달을 띄운다. 로그인을 고르면 지금 화면을 남겨 두고 로그인 후 resume 단계를 연다. */
  const requireLogin = (kind: LoginPromptKind, resume?: Step) => {
    if (isLoggedIn) return false;
    trackGA4Event('login_prompt_shown', {
      trigger: LOGIN_PROMPT[kind].trigger,
    });
    setLoginPrompt({ kind, resume });
    return true;
  };
  const goToLogin = () => {
    if (!loginPrompt) return;
    leave(loginPrompt.resume, { forLogin: true });
    bridgeToLogin(
      { trigger: LOGIN_PROMPT[loginPrompt.kind].trigger },
      { trackPrompt: false },
    );
    setLoginPrompt(null);
  };
  const move: typeof journey.move = (next, patch) => {
    setNotice(null);
    journey.move(next, patch);
  };
  const back = journey.back;
  /** 화면 안 '이전으로'. 직전이 처음 화면이면 '처음으로'와 같은 곳이라 두지 않는다. */
  const stepBack = previous && previous.step !== 'intro' ? back : undefined;
  const restart: typeof journey.restart = (next, patch) => {
    setNotice(null);
    journey.restart(next, patch);
  };
  const home = () => {
    restart();
    flow.reset();
    resetReview();
    reviewStartedFor.current = null;
    tracking.reset();
    resetStory();
    campaign.end();
  };
  /** 처음 화면이나 다른 흐름(빈 큐레이션·빈 찜 목록)에서 추천을 새로 시작한다. 같은 추천 안의 다시 시작은 startScenario만 쓴다. */
  const startRecommend = () => {
    campaign.start('recommend');
    startScenario();
  };
  const startScenario = () => {
    flow.reset();
    tracking.reset();
    resetStory();
    trackGA4Event('bartender_start', { entry: 'recommend' });
    move('scenario', { answers: 0, selection: null });
  };
  /** 답할 때마다 지나온 길에 남겨, 뒤로 가기로 이전 질문에 돌아갈 수 있게 한다. */
  const answerQuestion = (value: ScenarioAnswerValue) => {
    if (!flow.canAnswer) return;
    flow.answer(value);
    move('scenario', { answers: flow.answers.length + 1 });
  };
  const chooseAlcohol = (next: AlcoholSelection) => {
    if (
      step === 'recommendations' ||
      step === 'similar' ||
      isCandidateStep(step)
    ) {
      trackGA4Event('bartender_select_alcohol', {
        alcohol_id: String(next.id),
        entry_source: SELECT_SOURCE[step],
      });
    }
    move('detail', { selection: next });
  };
  const toggleFavorite = async () => {
    if (!selected || requireLogin('pick')) return;
    trackGA4Event('add_to_picks', {
      alcohol_id: String(selected.id),
      alcohol_name: selected.name,
      action: picks.isPicked(selected.id) ? 'remove' : 'add',
      entry_source: 'bartender_note',
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
      entry_source: 'bartender_note',
      entry_flow: campaign.reviewEntryFlow(),
    });
  };
  const postReview = async () => {
    if (!selected) return;
    const alcoholId = String(selected.id);
    const entryFlow = campaign.reviewEntryFlow();
    setNotice(null);
    try {
      const { reviewId, ratingSaved } = await submit.mutateAsync({
        alcoholId: selected.id,
        review,
      });
      trackGA4Event('write_review_complete', {
        alcohol_id: alcoholId,
        entry_source: 'bartender_note',
        entry_flow: entryFlow,
      });
      if (!ratingSaved)
        trackGA4Event('write_review_failed', {
          alcohol_id: alcoholId,
          failure_type: 'rating_save',
          entry_source: 'bartender_note',
          entry_flow: entryFlow,
        });
      reviewStartedFor.current = null;
      campaign.reach('review', 'RESULT');
      setPostedReviewId(reviewId);
      // 등록한 리뷰로 돌아가 다시 등록하지 않게, 뒤로 가기는 처음 화면으로 간다
      restart('review-done', { selection });
      if (!ratingSaved) setNotice('rating-failed');
    } catch (error) {
      trackGA4Event('write_review_failed', {
        alcohol_id: alcoholId,
        failure_type:
          error instanceof ReviewSubmitError ? error.stage : 'review_save',
        entry_source: 'bartender_note',
        entry_flow: entryFlow,
      });
      setNotice('review-failed');
    }
  };
  const openAlcoholPage = () => {
    if (!selection) return;
    trackGA4Event('bartender_open_alcohol_page', {
      alcohol_id: String(selection.id),
      entry_source: 'detail',
    });
    leave();
  };
  const start = (entry: 'situation' | 'review' | 'picks', next: Step) => {
    trackGA4Event('bartender_start', { entry });
    // 리뷰 시작은 로그인 안내 전에 센다. 찜한 술 보기는 재지 않는다
    campaign.start(CAMPAIGN_BY_ENTRY[entry]);
    if (entry === 'review' && requireLogin('review', next)) return;
    if (entry === 'picks' && requireLogin('pickList', next)) return;
    // 큐레이션은 매번 첫 페이지부터 보여 준다
    if (entry === 'situation') curationChoices.reset();
    move(next);
  };
  const writeReview = () => {
    if (!selected) return;
    campaign.startReview(REVIEW_ENTRY_BY_ORIGIN[talkOrigin], selected.id);
    if (requireLogin('review', 'review-mode')) return;
    move('review-mode');
  };

  const header = getStepHeader(step, {
    reviewMode: review.mode,
    // 다음 질문을 받는 동안은 방금 답한 질문의 번호를 둔다
    questionNumber: flow.answers.length + (flow.pending ? 0 : 1),
  });
  const scenarioStep = isScenarioStep(step);
  /** 시나리오 응답을 그대로 그리는 단계. 첫 잔은 고른 술의 상세로 그린다. */
  const scenarioView = scenarioStep && step !== 'first-pick';
  const scenarioData = flow.query.data;
  const stepLines = getDialogue({
    step,
    detailOrigin: previous?.step,
    selected,
    curationTitle: curation?.title,
    curationsState: curationChoices.state,
    notice,
    hasCandidates: (scenarioData?.candidates?.totalCount ?? 0) > 0,
    firstPickName: firstPick?.name,
    pickCount: picks.isLoading ? undefined : picks.items.length,
    scenarioUnavailable: flow.unavailable,
    similarBaseName: similarEntry?.name,
    similarState,
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
      : previous?.step === 'recommendations' ||
          previous?.step === 'favorites' ||
          previous?.step === 'curation-list' ||
          previous?.step === 'similar'
        ? previous.step
        : 'other';
  const dialogueLines = scenarioClosed
    ? ['질문 추천은 지금 준비하고 있어요.\n대신 다른 방법으로 골라 드릴게요.']
    : scenarioView && flow.query.isError && !flow.query.isFetchNextPageError
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
      emphasis={step === 'similar' ? similarEntry?.name : undefined}
      pose={
        talkStory?.pose ?? (thinking && scenarioView ? 'think' : bartender.pose)
      }
      onBack={previous ? back : undefined}
      backLabel={previous?.step === 'scenario' ? '이전 질문' : '이전 단계'}
      onClose={() => router.push(ROUTES.HOME)}
    >
      {step === 'intro' && (
        <>
          <OptionList
            items={[
              {
                title: '위스키 추천해 주세요',
                // 준비 중이면 메뉴는 그대로 두고 누를 수 없게 한다. 확인 전에는 지금처럼 들어간다
                description: flow.unavailable
                  ? '지금은 준비하고 있어요'
                  : '몇 가지 여쭤보고 골라 드려요',
                disabled: flow.unavailable,
                action: startRecommend,
              },
              {
                ...CURATION_OPTION,
                // GTM 기준을 지키려고 entry 값은 'situation'을 유지한다
                action: () => start('situation', 'curations'),
              },
              {
                ...REVIEW_OPTION,
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
        (scenarioClosed ? (
          <ScenarioUnavailable
            onCuration={() => start('situation', 'curations')}
            onReview={() => start('review', 'review-pick')}
            home={home}
          />
        ) : flow.query.isError && !flow.query.isFetchNextPageError ? (
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
                selectedAnswer={flow.selectedAnswer}
                onAnswer={answerQuestion}
                back={stepBack}
              />
            )}
            {step === 'recommendations' &&
              scenarioData.completed &&
              scenarioData.candidates && (
                <ScenarioCandidateList
                  candidates={scenarioData.candidates}
                  onChoose={(id) => chooseAlcohol({ id, source: 'api' })}
                  back={stepBack}
                  home={home}
                  loadMore={() => void flow.query.fetchNextPage()}
                  loadingMore={flow.query.isFetchingNextPage}
                  loadMoreError={flow.query.isFetchNextPageError}
                />
              )}
          </>
        ))}
      {step === 'similar' &&
        (similarEntry ? (
          <SimilarCandidateList
            query={similar}
            tags={similarEntry.tags}
            onChoose={chooseAlcohol}
            home={home}
            onLeave={() => leave()}
            emptyAction={
              flow.unavailable
                ? {
                    label: CURATION_OPTION.title,
                    onClick: () => start('situation', 'curations'),
                  }
                : { label: '위스키 추천해 주세요', onClick: startRecommend }
            }
          />
        ) : (
          // 주소에서 기준 위스키가 빠진 채 복원됐다. 다시 고를 수 있게 처음으로 보낸다
          <FlowAction onClick={home}>처음으로</FlowAction>
        ))}
      {step === 'favorites' && picks.isLoading && <LoadingStep />}
      {isCandidateStep(step) && !(step === 'favorites' && picks.isLoading) && (
        <CandidateList
          step={step}
          curationDetail={curationDetail}
          pickedItems={picks.items}
          hasMorePicks={picks.hasMore}
          onChoose={chooseAlcohol}
          move={move}
          back={stepBack}
          home={home}
          onLeave={() => leave()}
          emptyPicksAction={
            flow.unavailable
              ? {
                  label: CURATION_OPTION.title,
                  onClick: () => start('situation', 'curations'),
                }
              : { label: '위스키 추천해 주세요', onClick: startRecommend }
          }
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
                    if (requireLogin('otherCandidates', 'recommendations'))
                      return;
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
          back={stepBack}
          home={home}
        />
      )}
      <CurationFlow
        step={step}
        choices={curationChoices}
        setCurationId={setCurationId}
        move={move}
        home={home}
        onStartScenario={startRecommend}
        scenarioUnavailable={flow.unavailable}
        onStartReview={() => start('review', 'review-pick')}
        onShowPicks={() => start('picks', 'favorites')}
      />
      {(!requiresAlcohol || selected) && (
        <ReviewFlow
          step={step}
          review={review}
          updateReview={updateReview}
          selected={selected}
          move={move}
          back={back}
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
            reviewStartedFor.current = null;
            // 다른 술 리뷰는 새 시도로 센다
            campaign.start('review');
            restart('review-pick');
          }}
        />
      )}
      {loginPrompt && (
        <PromptModal
          mainText={LOGIN_PROMPT[loginPrompt.kind].title}
          subText={LOGIN_PROMPT[loginPrompt.kind].description}
          actionText={LOGIN_PROMPT[loginPrompt.kind].action}
          onAction={goToLogin}
          onClose={() => setLoginPrompt(null)}
        />
      )}
    </BartenderFrame>
  );
}
