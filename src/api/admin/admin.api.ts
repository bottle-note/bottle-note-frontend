import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';

export const AdminApi = {
  /**
   * 관리자 권한을 확인합니다.
   * @returns 권한 보유 여부
   */
  async checkPermissions(): Promise<ApiResponse<boolean>> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `/auth/admin/permissions`,
      {
        authRequired: true,
        baseUrl: 'bottle-api/v2',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    return response;
  },
};
