import { ApiResponse } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { ReportPostApi, UserReportQueryParams } from '@/types/Report';

export const ReportApi = {
  async registerUserReport(params: UserReportQueryParams) {
    const response = await fetchWithAuth(`/bottle-api/reports/user`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReportPostApi> = await response;
    return result.data;
  },
};
