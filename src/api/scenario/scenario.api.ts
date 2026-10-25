import type { ApiResponse } from '@/api/_shared/types';
import { apiClient } from '@/shared/api/apiClient';
import type {
  ScenarioEvaluateRequestDto,
  ScenarioEvaluationResponseDto,
} from './types';

function unwrap(response: ApiResponse<ScenarioEvaluationResponseDto>) {
  if (!response.success || response.errors.length > 0) {
    throw new Error('시나리오를 불러오지 못했습니다.');
  }
  return response.data;
}

export const ScenarioApi = {
  async get(scenarioId: number, signal?: AbortSignal) {
    return unwrap(
      await apiClient.get<ApiResponse<ScenarioEvaluationResponseDto>>(
        `/scenarios/${scenarioId}`,
        { authRequired: false, signal },
      ),
    );
  },
  async evaluate(
    scenarioId: number,
    request: ScenarioEvaluateRequestDto,
    signal?: AbortSignal,
  ) {
    return unwrap(
      await apiClient.post<ApiResponse<ScenarioEvaluationResponseDto>>(
        `/scenarios/${scenarioId}/evaluate`,
        request,
        { authRequired: false, signal },
      ),
    );
  },
};
