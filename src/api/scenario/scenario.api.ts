import type { ApiResponse } from '@/api/_shared/types';
import { apiClient } from '@/shared/api/apiClient';
import type {
  ScenarioEvaluateRequestDto,
  ScenarioEvaluationResponseDto,
  ScenarioListItemDto,
} from './types';

function dataOrThrow<T>(response: ApiResponse<T>) {
  if (!response.success || response.errors.length > 0) {
    throw new Error('시나리오를 불러오지 못했습니다.');
  }
  return response.data;
}

export const ScenarioApi = {
  /** 활성 게시 시나리오 목록. 로그인 없이 ID 순으로 받는다. */
  async list(signal?: AbortSignal) {
    return dataOrThrow(
      await apiClient.get<ApiResponse<ScenarioListItemDto[]>>('/scenarios', {
        authRequired: false,
        signal,
      }),
    );
  },
  async get(scenarioId: number, signal?: AbortSignal) {
    return dataOrThrow(
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
    return dataOrThrow(
      await apiClient.post<ApiResponse<ScenarioEvaluationResponseDto>>(
        `/scenarios/${scenarioId}/evaluate`,
        request,
        { authRequired: false, signal },
      ),
    );
  },
};
