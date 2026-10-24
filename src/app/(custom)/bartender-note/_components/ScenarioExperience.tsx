'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ScenarioApi } from '@/api/scenario/scenario.api';
import { trackCampaignEvent } from '@/api/campaign-content/campaign-content.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import LoginModal from '@/components/domain/auth/LoginModal';
import { ApiError } from '@/utils/ApiError';
import BartenderFrame from './BartenderFrame';
import { FlowAction, OptionList } from './FlowControls';
import {
  SCENARIO_CAMPAIGN,
  readScenario,
  saveScenario,
  handoffScenarioLogin,
  type ScenarioSnapshot,
} from './bartenderSnapshot';

const SCENARIO_ID = Number(process.env.NEXT_PUBLIC_BARTENDER_SCENARIO_ID || 3);

type Props = { onExit: () => void; onLeave: () => void };

export default function ScenarioExperience(props: Props) {
  const { user, isLoading } = useAuthSession();
  const viewed = useRef(false);
  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      trackCampaignEvent(SCENARIO_CAMPAIGN, 'VIEW');
    }
  }, []);
  if (isLoading) return <p role="status">로그인 상태를 확인하고 있어요.</p>;
  const owner = user ? `user:${user.userId}` : 'guest';
  return <ScenarioSession key={owner} {...props} owner={owner} />;
}

function ScenarioSession({
  onExit,
  onLeave,
  owner,
}: Props & { owner: string }) {
  const fresh = (): ScenarioSnapshot => ({
    owner,
    scenarioId: SCENARIO_ID,
    answers: [],
    mode: 'QUESTION',
    scrollTop: 0,
    pageCount: 1,
    questionTitles: {},
    started: false,
    finished: false,
    resultShown: false,
  });
  const [progress, setProgress] = useState(
    () => readScenario(owner, SCENARIO_ID) ?? fresh(),
  );
  const [showLogin, setShowLogin] = useState(false);
  const { versionId, answers, mode, viewQuestionId } = progress;
  const query = useInfiniteQuery({
    queryKey: [
      'bartender-scenario',
      owner,
      SCENARIO_ID,
      versionId,
      answers,
      mode,
      viewQuestionId,
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      versionId
        ? ScenarioApi.evaluate(
            SCENARIO_ID,
            {
              versionId,
              answers,
              mode,
              viewQuestionId,
              cursor: pageParam,
              size: 20,
            },
            signal,
          )
        : ScenarioApi.get(SCENARIO_ID, signal),
    getNextPageParam: (last) =>
      last.candidates.pagination.hasNext
        ? last.candidates.pagination.nextCursor ?? undefined
        : undefined,
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  const response = query.data?.pages.at(-1);
  const busy = query.isFetching && !query.isFetchingNextPage;
  const currentIndex = response?.question
    ? response.path.indexOf(response.question.questionId)
    : answers.length;
  const isResult = !!response && response.state !== 'QUESTION';
  const loggedIn = owner !== 'guest';
  const loadedPages = query.data?.pages.length ?? 0;
  const restoringPages =
    isResult &&
    loggedIn &&
    !query.isPlaceholderData &&
    loadedPages < (progress.pageCount ?? 1) &&
    query.hasNextPage;
  useEffect(() => {
    if (restoringPages && !query.isFetching && !query.isError)
      void query.fetchNextPage();
  }, [restoringPages, query.isFetching, query.isError, query.fetchNextPage]);

  useEffect(() => {
    if (!response || query.isPlaceholderData || query.isError) return;
    const next = {
      ...progress,
      versionId: response.versionId,
      pageCount: !query.hasNextPage
        ? Math.max(1, loadedPages)
        : Math.max(progress.pageCount ?? 1, loadedPages),
    };
    if (response.question)
      next.questionTitles = {
        ...next.questionTitles,
        [response.question.questionId]: response.question.title,
      };
    if (!progress.started) {
      trackCampaignEvent(SCENARIO_CAMPAIGN, 'START');
      next.started = true;
    }
    if (isResult && !progress.finished) {
      trackCampaignEvent(SCENARIO_CAMPAIGN, 'FINISH');
      next.finished = true;
    }
    if (isResult && loggedIn && !progress.resultShown) {
      trackCampaignEvent(SCENARIO_CAMPAIGN, 'RESULT');
      next.resultShown = true;
    }
    saveScenario(next);
    // GET 응답의 버전은 저장하되 첫 클릭 전에는 GET을 평가 요청으로 중복하지 않는다.
    const changed =
      next.pageCount !== progress.pageCount ||
      next.started !== progress.started ||
      next.finished !== progress.finished ||
      next.resultShown !== progress.resultShown ||
      (response.question &&
        progress.questionTitles[response.question.questionId] !==
          response.question.title);
    if (changed) setProgress({ ...next, versionId: progress.versionId });
  }, [
    response,
    progress,
    isResult,
    loggedIn,
    query.isPlaceholderData,
    query.isError,
    query.hasNextPage,
    loadedPages,
  ]);

  const restart = (newParticipation = true) => {
    const next = fresh();
    if (!newParticipation)
      Object.assign(next, {
        started: progress.started,
        finished: progress.finished,
        resultShown: progress.resultShown,
      });
    setProgress(next);
    saveScenario({ ...next, versionId: response?.versionId ?? versionId });
  };
  const back = () => {
    if (!response || busy) return;
    if (isResult && response.nextQuestionId) {
      setProgress({
        ...progress,
        versionId: response.versionId,
        mode: 'QUESTION',
        viewQuestionId: undefined,
        scrollTop: 0,
        pageCount: 1,
      });
    } else {
      const previous =
        answers[isResult ? answers.length - 1 : currentIndex - 1];
      if (!previous) onExit();
      else
        setProgress({
          ...progress,
          versionId: response.versionId,
          mode: 'QUESTION',
          viewQuestionId: previous.questionId,
          scrollTop: 0,
          pageCount: 1,
        });
    }
  };

  if (!response || query.isError || restoringPages) {
    const incompatible =
      query.error instanceof ApiError &&
      (query.error.response.status === 409 ||
        query.error.code === 'SCENARIO_INVALID');
    const unavailable =
      query.error instanceof ApiError && query.error.response.status === 404;
    return (
      <BartenderFrame
        key="pending"
        revealOptionsImmediately
        step="level"
        title="바텐더 노트"
        subtitle=""
        lines={[
          query.isError
            ? '추천을 불러오지 못했어요.'
            : restoringPages
              ? '추천 목록을 다시 불러오고 있어요.'
              : '질문을 준비하고 있어요.',
        ]}
        pose="idle"
        onClose={onExit}
        onBack={onExit}
      >
        {query.isError ? (
          <>
            <p role="alert" className="text-15">
              {incompatible
                ? '추천 질문이 바뀌었거나 저장한 선택지를 사용할 수 없어요. 처음부터 다시 선택해 주세요.'
                : unavailable
                  ? '아직 공개된 추천 시나리오가 없어요. 잠시 후 다시 찾아주세요.'
                  : '연결을 확인하고 다시 시도해 주세요.'}
            </p>
            <FlowAction
              onClick={() =>
                incompatible ? restart(false) : void query.refetch()
              }
            >
              {incompatible ? '처음부터 다시 선택할게요' : '다시 시도할게요'}
            </FlowAction>
          </>
        ) : (
          <p role="status">질문을 불러오고 있어요.</p>
        )}
      </BartenderFrame>
    );
  }

  const { question } = response;
  const candidates = Array.from(
    new Map(
      query.data?.pages
        .flatMap((page) => page.candidates.content)
        .map((item) => [item.alcoholId, item]),
    ).values(),
  );
  const lines = question
    ? [question.title]
    : !loggedIn
      ? ['추천을 준비했어요.\n로그인하고 결과를 확인해 주세요.']
      : [
          response.candidateCount
            ? `답변에 맞는 위스키 ${response.candidateCount}병을 찾았어요.\n마음에 드는 위스키를 살펴보세요.`
            : '모든 조건에 맞는 위스키가 아직 없어요.\n이전 답변을 바꿔서 다시 찾아볼까요?',
        ];

  return (
    <BartenderFrame
      key="ready"
      revealOptionsImmediately
      initialScrollTop={progress.scrollTop}
      step={question ? 'level' : 'recommendations'}
      title={question ? '바텐더 노트' : '바텐더 추천'}
      subtitle={question ? `질문 ${currentIndex + 1}` : '추천 결과'}
      progress={question ? undefined : 100}
      lines={lines}
      pose="idle"
      onBack={back}
      backLabel={
        isResult && response.nextQuestionId
          ? '질문을 더 볼게요'
          : currentIndex > 0
            ? '이전 질문'
            : '처음으로'
      }
      onClose={onExit}
    >
      <div aria-busy={busy} className="contents">
        {question ? (
          <>
            <p className="text-13 text-fg-neutral-muted" role="status">
              현재 후보 {response.candidateCount}병{busy ? ' · 확인 중' : ''}
            </p>
            {currentIndex < answers.length && (
              <p className="text-13 text-fg-neutral-muted">
                답변을 다시 선택하면 이후 답변은 초기화됩니다.
              </p>
            )}
            <OptionList
              items={question.options.map((option) => ({
                title: option.label,
                description: `${option.candidateCount}병${option.selectable ? '' : ' · 현재 조건에 맞는 위스키가 없어요'}`,
                selected: answers[currentIndex]?.optionId === option.optionId,
                action:
                  !busy && option.selectable
                    ? () =>
                        setProgress({
                          ...progress,
                          versionId: response.versionId,
                          answers: [
                            ...answers.slice(0, currentIndex),
                            {
                              questionId: question.questionId,
                              optionId: option.optionId,
                            },
                          ],
                          mode: 'QUESTION',
                          viewQuestionId: undefined,
                          scrollTop: 0,
                          pageCount: 1,
                        })
                    : undefined,
              }))}
            />
            <FlowAction
              disabled={busy}
              onClick={() =>
                setProgress({
                  ...progress,
                  versionId: response.versionId,
                  answers: answers.slice(0, currentIndex),
                  mode: 'RESULT',
                  viewQuestionId: undefined,
                  scrollTop: 0,
                  pageCount: 1,
                })
              }
            >
              바로 추천받을래요
            </FlowAction>
          </>
        ) : !loggedIn ? (
          <>
            <p className="text-15">
              로그인하면 지금까지 고른 조건으로 추천을 이어볼 수 있어요.
            </p>
            <FlowAction
              primary
              disabled={busy}
              onClick={() => {
                handoffScenarioLogin({
                  ...progress,
                  versionId: response.versionId,
                });
                setShowLogin(true);
              }}
            >
              로그인하고 추천 볼게요
            </FlowAction>
          </>
        ) : (
          <>
            {!answers.length && (
              <p className="text-14 text-fg-neutral-muted">
                아직 선택한 조건이 없어 전체 위스키를 보여드려요.
              </p>
            )}
            {!!response.answers.length && (
              <details className="rounded-lg bg-bg-neutral-weak p-12">
                <summary className="cursor-pointer text-14 font-bold">
                  내가 고른 조건 · 수정하기
                </summary>
                <div className="mt-10 flex flex-col gap-8">
                  {response.answers
                    .filter((answer) => answer.applied)
                    .map((answer, index) => (
                      <button
                        key={answer.questionId}
                        type="button"
                        disabled={busy}
                        className="text-left text-13 text-fg-neutral-muted underline"
                        onClick={() =>
                          setProgress({
                            ...progress,
                            versionId: response.versionId,
                            mode: 'QUESTION',
                            viewQuestionId: answer.questionId,
                            scrollTop: 0,
                            pageCount: 1,
                          })
                        }
                      >
                        {progress.questionTitles[answer.questionId] ??
                          `질문 ${index + 1}`}{' '}
                        {answer.label}
                      </button>
                    ))}
                </div>
              </details>
            )}
            <p role="status" className="text-15 font-bold">
              추천 {response.candidateCount}병{busy ? ' · 확인 중' : ''}
            </p>
            {candidates.map((candidate) => (
              <Link
                key={candidate.alcoholId}
                href={`/alcohols/${candidate.alcoholId}`}
                onClick={(event) => {
                  saveScenario({
                    ...progress,
                    versionId: response.versionId,
                    pageCount: loadedPages,
                    scrollTop:
                      event.currentTarget.closest('section')?.scrollTop ?? 0,
                  });
                  onLeave();
                }}
                className="flex gap-12 rounded-lg bg-bg-neutral-weak p-12 focus-visible:outline-stroke-focus-ring"
              >
                {candidate.imageUrl && (
                  <Image
                    unoptimized
                    src={candidate.imageUrl}
                    alt=""
                    width={56}
                    height={80}
                    className="h-80 w-56 rounded-md bg-white object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <b className="text-15">{candidate.korName}</b>
                  <p className="mt-4 text-13 text-fg-neutral-muted">
                    {[
                      candidate.korCategory,
                      candidate.abv
                        ? `도수 ${candidate.abv.trim()}${candidate.abv.trim().endsWith('%') ? '' : '%'}`
                        : '도수 정보 없음',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
            {query.hasNextPage && (
              <FlowAction
                disabled={query.isFetching}
                onClick={() => void query.fetchNextPage()}
              >
                {query.isFetchingNextPage
                  ? '더 불러오고 있어요'
                  : '추천 더 볼게요'}
              </FlowAction>
            )}
            {!response.candidateCount && (
              <p className="text-14 text-fg-neutral-muted">
                이전 조건을 바꾸거나 ‘상관없어요’를 선택해보세요.
              </p>
            )}
            <FlowAction disabled={busy} onClick={() => restart()}>
              다시 추천받을게요
            </FlowAction>
          </>
        )}
      </div>
      {showLogin && (
        <LoginModal
          returnTo="/bartender-note?flow=scenario"
          handleClose={() => setShowLogin(false)}
        />
      )}
    </BartenderFrame>
  );
}
