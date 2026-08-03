import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import { apiClient } from '@/shared/api/apiClient';
import type { AgreementStatusResponse, AgreementSubmitRequest } from './types';

export const AgreementApi = {
  async getStatus(): Promise<ApiResponse<AgreementStatusResponse>> {
    const response = await apiClient.get<ApiResponse<AgreementStatusResponse>>(
      '/agreements/status',
      { baseUrl: 'bottle-api/v2', authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.AGREEMENT_FETCH_FAILED);
    }

    return response;
  },

  async submit(
    body: AgreementSubmitRequest,
  ): Promise<ApiResponse<AgreementStatusResponse>> {
    const response = await apiClient.post<ApiResponse<AgreementStatusResponse>>(
      '/agreements',
      body,
      {
        baseUrl: 'bottle-api/v2',
        authRequired: true,
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.AGREEMENT_SUBMIT_FAILED);
    }

    return response;
  },
};
