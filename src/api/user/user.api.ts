import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  UserInfo,
  CurrentUserInfo,
  ChangeNicknameResponse,
  ChangeProfileImageResponse,
  DeviceInfoParams,
  DeviceInfoResponse,
  DeleteAccountResponse,
} from './types';

export const UserApi = {
  /**
   * 닉네임을 변경합니다.
   */
  async changeNickname(
    nickName: string,
  ): Promise<ApiResponse<ChangeNicknameResponse>> {
    const response = await apiClient.patch<ApiResponse<ChangeNicknameResponse>>(
      '/users/nickname',
      { nickName },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.USER_UPDATE_FAILED);
    }

    return response;
  },

  /**
   * 사용자 프로필 정보를 조회합니다.
   */
  async getUserInfo({
    userId,
  }: {
    userId: string;
  }): Promise<ApiResponse<UserInfo>> {
    const response = await apiClient.get<ApiResponse<UserInfo>>(
      `/my-page/${userId}`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.USER_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 프로필 이미지를 변경합니다.
   */
  async changeProfileImage(
    profileImageSrc: string | null,
  ): Promise<ApiResponse<ChangeProfileImageResponse>> {
    const response = await apiClient.patch<
      ApiResponse<ChangeProfileImageResponse>
    >(
      '/users/profile-image',
      { viewUrl: profileImageSrc },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.USER_UPDATE_FAILED);
    }

    return response;
  },

  /**
   * 기기 정보를 서버에 전송합니다 (푸시 알림용).
   */
  async sendDeviceInfo(
    params: DeviceInfoParams,
  ): Promise<ApiResponse<DeviceInfoResponse>> {
    const { deviceToken, platform } = params;

    const response = await apiClient.post<ApiResponse<DeviceInfoResponse>>(
      '/push/token',
      { deviceToken, platform },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
    }

    return response;
  },

  /**
   * 계정을 삭제합니다 (회원 탈퇴).
   */
  async deleteAccount(): Promise<ApiResponse<DeleteAccountResponse>> {
    const response = await apiClient.delete<ApiResponse<DeleteAccountResponse>>(
      '/users',
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.DELETE_FAILED);
    }

    return response;
  },

  /**
   * 현재 로그인한 사용자의 정보를 조회합니다.
   */
  async getCurUserInfo(): Promise<ApiResponse<CurrentUserInfo>> {
    const response = await apiClient.get<ApiResponse<CurrentUserInfo>>(
      '/users/current',
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.USER_FETCH_FAILED);
    }

    return response;
  },
};

export type { UserInfo, CurrentUserInfo } from './types';
