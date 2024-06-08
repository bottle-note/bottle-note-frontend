import { fetchWithAuth } from '@/utils/fetchWithAuth';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const UserApi = {
  async changeNickname() {
    const response = await fetchWithAuth(`${BASE_URL}/users/nickname`, {
      method: 'PATCH',
      body: JSON.stringify({
        nickName: '에헤?',
      }),
    });

    const { data } = await response.json();
    return data.accessToken;
  },
};
