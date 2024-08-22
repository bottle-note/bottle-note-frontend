import { ApiResponse } from '@/types/common';
import { UserInfoApi } from '@/types/User';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const UserApi = {
  async changeNickname(nickName: string): Promise<
    ApiResponse<{
      message: string;
      userId: number;
      beforeNickname: string;
      changedNickname: string;
    }>
  > {
    const response = await fetchWithAuth(`/bottle-api/users/nickname`, {
      method: 'PATCH',
      body: JSON.stringify({
        nickName,
      }),
    });

    return response;
  },

  async getUserInfo({ userId }: { userId: string }) {
    const response = await fetchWithAuth(`/bottle-api/my-page/${userId}`);
    const { data }: ApiResponse<UserInfoApi> = response;

    return data;
  },

  async changeProfileImage(profileImageSrc: string | null) {
    const response = await fetchWithAuth(`/bottle-api//users/profile-image`, {
      method: 'PATCH',
      body: JSON.stringify({
        viewUrl: profileImageSrc,
      }),
    });

    const {
      data,
    }: ApiResponse<{
      userId: string;
      profileImageUrl: string | null;
      callback: string;
    }> = response;

    return data;
  },
};
