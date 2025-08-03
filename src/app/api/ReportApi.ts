import { ApiResponse } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import { ReportTypeMap } from '@/types/Report';

type ReportEndpoint = 'user' | 'review' | 'comment';

const REPORT_ENDPOINTS: Record<ReportEndpoint, string> = {
  user: '/reports/user',
  review: '/reports/review',
  comment: '', // 추후 추가될 엔드포인트
} as const;

export const ReportApi = {
  async registerReport<T extends ReportEndpoint>(
    type: T,
    params: ReportTypeMap[T]['params'],
  ): Promise<ReportTypeMap[T]['response']> {
    const response = await apiClient.post<
      ApiResponse<ReportTypeMap[T]['response']>
    >(REPORT_ENDPOINTS[type], params);

    return response.data;
  },
};
