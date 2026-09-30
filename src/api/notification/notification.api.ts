import type { ApiResponse } from '@/api/_shared/types';
import { apiClient } from '@/shared/api/apiClient';
import type {
  NotificationListData,
  NotificationMarkAllReadData,
  NotificationMarkReadData,
  NotificationSettingsData,
  NotificationSettingsUpdateRequest,
  NotificationUnreadCountData,
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

export const NotificationInboxApi = {
  async getList(cursor?: string): Promise<ApiResponse<NotificationListData>> {
    const params = new URLSearchParams({ size: '10' });
    if (cursor) params.set('cursor', cursor);
    const response = await apiClient.get<ApiResponse<NotificationListData>>(
      `/notifications?${params.toString()}`,
      {
        authRequired: true,
      },
    );
    requireInboxSuccess(response);
    return response;
  },
  async getUnreadCount(): Promise<NotificationUnreadCountData> {
    const response = await apiClient.get<
      ApiResponse<NotificationUnreadCountData>
    >('/notifications/unread-count', { authRequired: true });
    return requireInboxSuccess(response);
  },
  async markRead(id: number): Promise<NotificationMarkReadData> {
    const response = await apiClient.patch<
      ApiResponse<NotificationMarkReadData>
    >(`/notifications/${id}/read`, undefined, { authRequired: true });
    return requireInboxSuccess(response);
  },
  async markAllRead(): Promise<NotificationMarkAllReadData> {
    const response = await apiClient.patch<
      ApiResponse<NotificationMarkAllReadData>
    >('/notifications/read-all', undefined, { authRequired: true });
    return requireInboxSuccess(response);
  },
};

function requireInboxSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success || response.errors.length > 0) {
    throw new Error('알림 요청에 실패했습니다.');
  }
  return response.data;
}
