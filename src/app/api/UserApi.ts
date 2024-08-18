import { ApiResponse } from '@/types/common';
import { UserInfoApi } from '@/types/User';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const UserApi = {
  async changeNickname(nickName: string) {
    const response = await fetchWithAuth(`/bottle-api/users/nickname`, {
      method: 'PATCH',
      body: JSON.stringify({
        nickName,
      }),
    });

    const { data } = response;
    return data;
  },

  async getUserInfo({ userId }: { userId: string }) {
    const response = await fetchWithAuth(`/bottle-api/mypage/${userId}`);
    const { data }: ApiResponse<UserInfoApi> = response;

    return data;
  },
};
