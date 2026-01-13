import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { ReportEndpoint, ReportTypeMap } from './types';

const REPORT_ENDPOINTS: Record<ReportEndpoint, string> = {
  user: '/reports/user',
  review: '/reports/review',
  comment: '', // 추후 추가될 엔드포인트
} as const;

export const ReportApi = {
  /**
   * 신고를 등록합니다.
   * @param type - 신고 유형 (user, review, comment)
   * @param params - 신고 파라미터
   * @returns 신고 결과
   */
  async registerReport<T extends ReportEndpoint>(
    type: T,
    params: ReportTypeMap[T]['params'],
  ): Promise<ApiResponse<ReportTypeMap[T]['response']>> {
    const endpoint = REPORT_ENDPOINTS[type];

    if (!endpoint) {
      throw new Error(ERROR_MESSAGES.REPORT_CREATE_FAILED);
    }

    const response = await apiClient.post<
      ApiResponse<ReportTypeMap[T]['response']>
    >(endpoint, params, { authRequired: true });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REPORT_CREATE_FAILED);
    }

    return response;
  },
};

export type {
  ReportEndpoint,
  UserReportParams,
  ReviewReportParams,
} from './types';
