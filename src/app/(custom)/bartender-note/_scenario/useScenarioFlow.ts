import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

/** 답변만 로컬에 보관하고, 질문·후보·완료 여부는 Query 결과를 사용한다. */
export function useScenarioFlow({ context, active }: UseScenarioFlowOptions) {
  const [answers, setAnswers] = useState<ScenarioAnswer[]>([]);
  const query = useQuery({
    queryKey: [
      'bartender-note',
      'scenario-step',
      context.groupId,
      context.scenarioId,
      answers,
    ],
    queryFn: ({ signal }) => getScenarioStep({ context, answers }, signal),
    enabled: active,
    retry: false,
  });

  const canAnswer =
    active &&
    !query.isFetching &&
    !query.isError &&
    Boolean(query.data?.question);

  const answer = (value: ScenarioAnswerValue) => {
    const question = query.data?.question;
    if (!canAnswer || !question) return;
    setAnswers([...answers, { questionId: question.id, value }]);
  };

  const back = () => setAnswers((current) => current.slice(0, -1));
  const reset = () => setAnswers([]);
  const restore = (savedAnswers: ScenarioAnswer[]) => setAnswers(savedAnswers);

  return {
    answers,
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
