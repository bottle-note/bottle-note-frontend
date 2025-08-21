import { apiClient } from '@/shared/api/apiClient';

export const AdminApi = {
  async checkPermissions(): Promise<boolean> {
    const response = await apiClient.get<{ data: boolean }>(
      `/auth/admin/permissions`,
      {
        baseUrl: 'bottle-api/v2',
      },
    );

    return response.data;
  },
};
