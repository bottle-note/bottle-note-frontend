import { useState } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import type {
  ScenarioAnswer,
  ScenarioAnswerValue,
  ScenarioContext,
  ScenarioStepResponse,
} from './model';
import { getScenarioStep } from './scenarioApi';

/** 조회 키 끝의 [버전, 답변]. */
const sessionOf = (key: QueryKey) =>
  key.slice(-2) as [number | null, ScenarioAnswer[]];

interface UseScenarioFlowOptions {
  context: ScenarioContext;
  active: boolean;
  /** 결과 첫 페이지를 보여 주기 전에 준비할 일. 그동안 마지막 질문을 그대로 둔다. */
  prepareResult?: (result: ScenarioStepResponse) => Promise<void>;
}

/** 답변과 진행 버전만 로컬에 보관한다. 질문·후보는 Query 캐시에서 읽는다. */
export function useScenarioFlow({
  context,
  active,
  prepareResult,
}: UseScenarioFlowOptions) {
  const client = useQueryClient();
  const [{ answers, versionId }, setSession] = useState<{
    answers: ScenarioAnswer[];
    versionId: number | null;
  }>({ answers: [], versionId: null });
  const queryKey = ['bartender-note', 'scenario-step', context.scenarioId];
  const query = useInfiniteQuery({
    queryKey: [...queryKey, versionId, answers],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ signal, pageParam }) => {
      const step = await getScenarioStep(
        { context, answers, versionId, cursor: pageParam },
        signal,
      );
      if (step.completed && !pageParam) await prepareResult?.(step);
      return step;
    },
    getNextPageParam: (lastPage) =>
      lastPage.completed
        ? lastPage.candidates?.nextCursor ?? undefined
        : undefined,
    select: ({ pages }) => {
      const first = pages[0];
      const last = pages[pages.length - 1];
      return {
        ...first,
        candidates: first.candidates
          ? {
              ...first.candidates,
              items: pages.flatMap((page) => page.candidates?.items ?? []),
              nextCursor: last.candidates?.nextCursor ?? null,
            }
          : null,
      };
    },
    // 방금 답한 질문은 다음 질문이 올 때까지 그대로 둔다. 답을 하나 더한 조회에만 잇는다.
    placeholderData: (previous, previousQuery) => {
      if (!previous || !previousQuery) return undefined;
      const [previousVersion, previousAnswers] = sessionOf(
        previousQuery.queryKey,
      );
      // 첫 질문은 버전 없이 조회하고, 첫 답부터 그 버전을 싣는다
      return (previousVersion === versionId || previousVersion === null) &&
        previousAnswers.length === answers.length - 1 &&
        previousAnswers.every((answer, index) => answer === answers[index])
        ? previous
        : undefined;
    },
    enabled: active,
    retry: false,
    // 서명된 보기를 고르는 동안 자동 재조회로 질문이 교체되지 않게 한다.
    staleTime: Infinity,
  });

  const canAnswer =
    active &&
    !query.isFetching &&
    !query.isError &&
    Boolean(query.data?.question);

  const answer = (value: ScenarioAnswerValue) => {
    const question = query.data?.question;
    if (!canAnswer || !question) return;
    setSession({
      versionId: query.data!.versionId,
      answers: [...answers, { questionId: question.id, value }],
    });
  };

  const back = () =>
    setSession((current) => ({
      ...current,
      answers: current.answers.slice(0, -1),
    }));
  const reset = () => {
    void client.invalidateQueries({ queryKey, refetchType: 'none' });
    void client.resetQueries({
      queryKey: [...queryKey, null, []],
      exact: true,
    });
    setSession({ answers: [], versionId: null });
  };
  const restore = (
    savedAnswers: ScenarioAnswer[],
    savedVersionId: number | null,
  ) => setSession({ answers: savedAnswers, versionId: savedVersionId });

  /** 다음 질문을 받는 중이라 보이는 질문이 방금 답한 질문인지. */
  const pending = query.isPlaceholderData;

  return {
    answers,
    pending,
    /** 다음 질문을 받는 동안 보이는 질문에 고른 답. */
    pendingAnswer: pending ? answers[answers.length - 1]?.value : undefined,
    versionId: versionId ?? query.data?.versionId ?? null,
    query,
    canAnswer,
    canGoBack: answers.length > 0,
    answer,
    back,
    reset,
    restore,
    retry: query.refetch,
  };
}
