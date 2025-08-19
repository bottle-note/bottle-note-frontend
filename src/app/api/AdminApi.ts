import { apiClient } from '@/shared/api/apiClient';

export const AdminApi = {
  async checkPermissions(): Promise<boolean> {
    try {
      // Generate a simple CSRF token (timestamp + random)
      const csrfToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const response = await apiClient.get<{ data: boolean }>(
        `/auth/admin/permissions?_csrf=${csrfToken}`,
        {
          baseUrl: 'bottle-api/v2',
        },
      );

      return response.data;
    } catch (e) {
      console.error('Admin permissions check failed:', e);
      throw new Error('관리자 권한 확인에 실패했습니다.');
    }
  },
};
