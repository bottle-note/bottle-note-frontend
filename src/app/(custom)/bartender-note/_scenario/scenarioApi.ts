import { ScenarioApi } from '@/api/scenario/scenario.api';
import { adaptScenarioStep } from './adaptScenarioStep';
import type { ScenarioStepRequest, ScenarioStepResponse } from './model';

/** 시나리오 목록에 해당 code가 없다. 코드 미지정·비활성·미게시가 모두 여기에 해당한다. */
export class ScenarioNotFoundError extends Error {
  constructor(code: string) {
    super(`게시된 시나리오가 없습니다: ${code}`);
    this.name = 'ScenarioNotFoundError';
  }
}

/** 활성 게시 시나리오 목록에서 code에 해당하는 ID를 찾는다. */
export async function findScenarioId(code: string, signal?: AbortSignal) {
  const scenarios = await ScenarioApi.list(signal);
  const found = scenarios.find((scenario) => scenario.code === code);
  if (!found) throw new ScenarioNotFoundError(code);
  return found.scenarioId;
}

/** HTTP 요청 구성과 서버 DTO → 화면 모델 변환을 연결한다. */
export async function getScenarioStep(
  request: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<ScenarioStepResponse> {
  const { scenarioId, answers, versionId, cursor } = request;
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
      ? await ScenarioApi.get(scenarioId, signal)
      : await ScenarioApi.evaluate(
          scenarioId,
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
