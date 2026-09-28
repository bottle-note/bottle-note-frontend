import type { ApiResponse } from '@/api/_shared/types';
import { apiClient } from '@/shared/api/apiClient';
import type {
  NotificationSettingsData,
  NotificationSettingsUpdateRequest,
} from './types';

const endpoint = '/notifications/settings';

type SettingsResponse = ApiResponse<NotificationSettingsData>;

function requireSuccess(response: SettingsResponse): NotificationSettingsData {
  if (!response.success || response.errors.length > 0) {
    throw new Error('알림 수신 설정 요청에 실패했습니다.');
  }
  return response.data;
}

export const NotificationSettingsApi = {
  async getSettings(): Promise<NotificationSettingsData> {
    const response = await apiClient.get<SettingsResponse>(endpoint, {
      authRequired: true,
    });
    return requireSuccess(response);
  },
  async updateSettings(
    body: NotificationSettingsUpdateRequest,
  ): Promise<NotificationSettingsData> {
    const response = await apiClient.patch<SettingsResponse>(endpoint, body, {
      authRequired: true,
    });
    return requireSuccess(response);
  },
};
