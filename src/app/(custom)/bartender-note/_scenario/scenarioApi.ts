import { ScenarioApi } from '@/api/scenario/scenario.api';
import { adaptScenarioStep } from './adaptScenarioStep';
import type { ScenarioStepRequest, ScenarioStepResponse } from './model';

/** HTTP 요청 구성과 서버 DTO → 화면 모델 변환을 연결한다. */
export async function getScenarioStep(
  request: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<ScenarioStepResponse> {
  const { context, answers, versionId, cursor } = request;
  if (versionId == null && (answers.length > 0 || cursor)) {
    throw new Error('답변을 평가하려면 조회한 시나리오 버전이 필요합니다.');
  }
  const submitted = answers.map(({ questionId, value }) => {
    if (value.kind !== 'choice') {
      throw new Error('서버에서 제공한 보기를 선택해 주세요.');
    }
    return { questionId, optionId: value.choiceId };
  });
  const response =
    versionId == null
      ? await ScenarioApi.get(context.scenarioId, signal)
      : await ScenarioApi.evaluate(
          context.scenarioId,
          {
            versionId,
            answers: submitted,
            mode: cursor ? 'RESULT' : 'QUESTION',
            ...(cursor ? { cursor } : {}),
          },
          signal,
        );
  signal?.throwIfAborted();
  return adaptScenarioStep(response);
}
