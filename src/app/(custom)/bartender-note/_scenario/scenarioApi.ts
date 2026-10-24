import { adaptScenarioStep } from './adaptScenarioStep';
import { getMockScenarioStep } from './mockScenario';
import type { ScenarioStepRequest, ScenarioStepResponse } from './model';

/** 현재는 목 소스 사용. Product 계약 확정 후 실제 요청과 응답 매핑을 연결한다. */
export async function getScenarioStep(
  request: ScenarioStepRequest,
  signal?: AbortSignal,
): Promise<ScenarioStepResponse> {
  const response = await getMockScenarioStep(request, signal);
  signal?.throwIfAborted();
  return adaptScenarioStep(response);
}
