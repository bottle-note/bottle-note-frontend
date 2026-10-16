import { useEffect, useRef } from 'react';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { GA4EventMap } from '@/utils/analytics/types';
import type { Answers, Step } from './types';

type Result = GA4EventMap['bartender_recommend_result'];

function tasteResult(exactCount: number, similarCount: number): Result {
  if (exactCount > 0) return { mode: 'taste', result_state: 'exact' };
  if (similarCount > 0) return { mode: 'taste', result_state: 'similar' };
  return { mode: 'taste', result_state: 'empty' };
}

/**
 * 추천 결과를 처음 볼 때 한 번 보낸다.
 * 술 상세에서 돌아와 같은 결과를 다시 볼 때는 보내지 않고, 답을 바꿔 새 결과를 보면 다시 보낸다.
 */
export function useTrackRecommendResult({
  step,
  answers,
  exactCount,
  similarCount,
  curationId,
  situation,
}: {
  step: Step;
  answers: Answers;
  exactCount: number;
  similarCount: number;
  curationId: number | null;
  situation: string;
}) {
  const lastResult = useRef<string | null>(null);

  useEffect(() => {
    const viewed: { key: string; result: Result } | null = (() => {
      if (step === 'recommendations')
        return {
          key: `taste:${JSON.stringify(answers)}`,
          result: tasteResult(exactCount, similarCount),
        };
      if (step === 'curation-list')
        return {
          key: `curation:${curationId}`,
          result: { mode: 'situation', result_state: 'exact' },
        };
      if (step === 'curation-empty')
        return {
          key: `curation-empty:${situation}`,
          result: { mode: 'situation', result_state: 'empty' },
        };
      return null;
    })();
    if (!viewed || lastResult.current === viewed.key) return;
    lastResult.current = viewed.key;
    trackGA4Event('bartender_recommend_result', viewed.result);
  }, [step]);
}
