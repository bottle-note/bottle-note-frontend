import { ApiResponse } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { ReportTypeMap } from '@/types/Report';

type ReportEndpoint = 'user' | 'review' | 'comment';

const REPORT_ENDPOINTS: Record<ReportEndpoint, string> = {
  user: '/bottle-api/reports/user',
  review: '/bottle-api/reports/review',
  comment: '', // 추후 추가될 엔드포인트
} as const;

export const ReportApi = {
  async registerReport<T extends ReportEndpoint>(
    type: T,
    params: ReportTypeMap[T]['params'],
  ): Promise<ReportTypeMap[T]['response']> {
    const response = await fetchWithAuth(REPORT_ENDPOINTS[type], {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw response;
    }

    const result: ApiResponse<ReportTypeMap[T]['response']> = await response;
    return result.data;
  },
};
