import { ApiResponse } from '@/types/common';
import { UserInfoApi, CurrentUserInfoApi } from '@/types/User';
import { apiClient } from '@/shared/api/apiClient';

export const UserApi = {
  async changeNickname(nickName: string): Promise<
    ApiResponse<{
      message: string;
      userId: number;
      beforeNickname: string;
      changedNickname: string;
    }>
  > {
    const response = await apiClient.patch<
      ApiResponse<{
        message: string;
        userId: number;
        beforeNickname: string;
        changedNickname: string;
      }>
    >('/users/nickname', { nickName });

    return response;
  },

  async getUserInfo({ userId }: { userId: string }): Promise<UserInfoApi> {
    const response = await apiClient.get<{ data: UserInfoApi }>(
      `/my-page/${userId}`,
      {
        useAuth: false,
        cache: 'force-cache',
      },
    );

    return response.data;
  },

  async changeProfileImage(profileImageSrc: string | null) {
    const response = await apiClient.patch<
      ApiResponse<{
        userId: string;
        profileImageUrl: string | null;
        callback: string;
      }>
    >('/users/profile-image', {
      viewUrl: profileImageSrc,
    });

    return response.data;
  },

  async sendDeviceInfo(deviceToken: string, platform: string) {
    const response = await apiClient.post<
      ApiResponse<{
        deviceToken: string;
        platform: string;
        message: string;
      }>
    >('/push/token', {
      deviceToken,
      platform,
    });

    return response;
  },

  async deleteAccount() {
    const response = await apiClient.delete<
      ApiResponse<{
        codeMessage: string;
        message: string;
        userId: number;
        responseAt: string;
      }>
    >('/users');

    return response;
  },

  async getCurUserInfo(): Promise<CurrentUserInfoApi> {
    const response = await apiClient.get<{ data: CurrentUserInfoApi }>(
      '/users/current',
    );

    return response.data;
  },
};
