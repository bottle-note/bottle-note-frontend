import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ScenarioAnswer,
  ScenarioAnswerValue,
  ScenarioContext,
} from './model';
import { getScenarioStep } from './scenarioApi';

interface UseScenarioFlowOptions {
  context: ScenarioContext;
  active: boolean;
}

/** 답변과 진행 버전만 로컬에 보관한다. 질문·후보는 Query 캐시에서 읽는다. */
export function useScenarioFlow({ context, active }: UseScenarioFlowOptions) {
  const client = useQueryClient();
  const [{ answers, versionId }, setSession] = useState<{
    answers: ScenarioAnswer[];
    versionId: number | null;
  }>({ answers: [], versionId: null });
  const queryKey = ['bartender-note', 'scenario-step', context.scenarioId];
  const query = useInfiniteQuery({
    queryKey: [...queryKey, versionId, answers],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      getScenarioStep(
        { context, answers, versionId, cursor: pageParam },
        signal,
      ),
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

  return {
    answers,
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
