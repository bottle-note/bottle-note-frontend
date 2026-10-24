import { apiClient } from '@/shared/api/apiClient';
import type { ApiResponse, PaginationMeta } from '@/api/_shared/types';

export type ScenarioAnswer = { questionId: number; optionId: string };
export type ScenarioRequest = {
  versionId: number;
  answers: ScenarioAnswer[];
  mode: 'QUESTION' | 'RESULT';
  viewQuestionId?: number;
  cursor?: string;
  size?: number;
};
export type ScenarioResponse = {
  scenarioId: number;
  title: string;
  versionId: number;
  state: 'QUESTION' | 'USER_FINISHED' | 'SCENARIO_END';
  nextQuestionId: number | null;
  path: number[];
  answers: (ScenarioAnswer & { label: string; applied: boolean })[];
  question: {
    questionId: number;
    title: string;
    options: {
      optionId: string;
      label: string;
      kind: 'CHOICE' | 'NUMBER_RANGE' | 'ANY';
      candidateCount: number;
      selectable: boolean;
    }[];
  } | null;
  candidateCount: number;
  candidates: {
    content: {
      alcoholId: number;
      korName: string;
      engName: string;
      imageUrl: string | null;
      korCategory: string | null;
      abv: string | null;
    }[];
    pagination: PaginationMeta;
  };
};

export const ScenarioApi = {
  async get(id: number, signal?: AbortSignal) {
    const response = await apiClient.get<ApiResponse<ScenarioResponse>>(
      `/scenarios/${id}`,
      { authRequired: false, signal },
    );
    return response.data;
  },
  async evaluate(id: number, request: ScenarioRequest, signal?: AbortSignal) {
    const response = await apiClient.post<ApiResponse<ScenarioResponse>>(
      `/scenarios/${id}/evaluate`,
      request,
      { authRequired: false, signal },
    );
    return response.data;
  },
};
