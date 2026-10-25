import { useEffect, useRef } from 'react';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { GA4EventMap } from '@/utils/analytics/types';
import type { BartenderSnapshot } from './bartenderSnapshot';
import type { Step } from './types';
import type {
  ScenarioAnswer,
  ScenarioContext,
  ScenarioStepResponse,
} from '../_scenario/model';

type Result = GA4EventMap['bartender_recommend_result'];
const scenarioKey = (context: ScenarioContext, answers: ScenarioAnswer[]) =>
  `scenario:${JSON.stringify([context.scenarioId, answers])}`;

/** 성공한 결과만 추적하며 재조회·상세 복귀로 같은 결과를 다시 보내지 않는다. */
export function useTrackRecommendResult({
  step,
  context,
  answers,
  response,
  isSuccess,
  curationId,
  situation,
}: {
  step: Step;
  context: ScenarioContext;
  answers: ScenarioAnswer[];
  response: ScenarioStepResponse | undefined;
  isSuccess: boolean;
  curationId: number | null;
  situation: string;
}) {
  const lastResult = useRef<string | null>(null);
  useEffect(() => {
    let viewed: { key: string; result: Result } | null = null;
    if (
      step === 'recommendations' &&
      isSuccess &&
      response?.completed &&
      response.candidates
    ) {
      viewed = {
        key: scenarioKey(context, answers),
        result: {
          mode: 'taste',
          result_state:
            response.candidates.totalCount > 0 ? 'available' : 'empty',
        },
      };
    } else if (step === 'curation-list') {
      viewed = {
        key: `curation:${curationId}`,
        result: { mode: 'situation', result_state: 'exact' },
      };
    } else if (step === 'curation-empty') {
      viewed = {
        key: `curation-empty:${situation}`,
        result: { mode: 'situation', result_state: 'empty' },
      };
    }
    if (!viewed || lastResult.current === viewed.key) return;
    lastResult.current = viewed.key;
    trackGA4Event('bartender_recommend_result', viewed.result);
  }, [
    step,
    context.scenarioId,
    answers,
    response,
    isSuccess,
    curationId,
    situation,
  ]);

  const restore = (saved: BartenderSnapshot) => {
    const steps = [...saved.journey.history, saved.journey.step];
    if (steps.includes('recommendations')) {
      lastResult.current = scenarioKey(
        saved.scenario.context,
        saved.scenario.answers,
      );
    } else if (steps.includes('curation-list')) {
      lastResult.current = `curation:${saved.curationId}`;
    } else if (steps.includes('curation-empty')) {
      lastResult.current = `curation-empty:${saved.situation}`;
    }
  };
  return {
    reset: () => {
      lastResult.current = null;
    },
    restore,
  };
}
