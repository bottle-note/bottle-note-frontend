import { ApiResponse } from '@/types/common';
import { UserInfoApi } from '@/types/User';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const UserApi = {
  async changeNickname() {
    const response = await fetchWithAuth(`/bottle-api/users/nickname`, {
      method: 'PATCH',
      body: JSON.stringify({
        nickName: '에헤?',
      }),
    });

    const { data } = await response.json();
    return data.accessToken;
  },

  async getUserInfo({ userId }: { userId: string }) {
    const response = await fetchWithAuth(`/bottle-api/mypage/${userId}`);
    const { data }: ApiResponse<UserInfoApi> = response;

    return data;
  },
};
