import { AlcoholAPI } from '@/types/Alcohol';
import { ApiResponse, MyBottleQueryParams } from '@/types/common';
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

  async getUserInfo({
    userId,
  }: {
    userId: string;
  }): Promise<ApiResponse<UserInfoApi>> {
    const response = await fetch(`/bottle-api/my-page/${userId}`);

    const { data } = await response.json();

    return data;
  },

  async changeProfileImage(profileImageSrc: string | null) {
    const response = await fetchWithAuth(`/bottle-api/users/profile-image`, {
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

  async myBottle({
    params,
    userId,
  }: {
    params: MyBottleQueryParams;
    userId: number;
  }) {
    const {
      keyword,
      regionId,
      tabType,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    } = params;
    const response = await fetchWithAuth(
      `/bottle-api/my-page/${userId}/my-bottle?tabType=${tabType}&keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const result: ApiResponse<{
      isMyPage: boolean;
      totalCount: number;
      myBottleList: (AlcoholAPI & { hasReviewByMe: boolean })[];
      userId: number;
    }> = response;

    return result;
  },

  async sendDeviceInfo(deviceToken: string, platform: string) {
    const response = await fetchWithAuth(`/bottle-api/push/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken,
        platform,
      }),
    });

    const result: ApiResponse<{
      deviceToken: string;
      platform: string;
      message: string;
    }> = await response;

    return result;
  },

  async deleteAccount() {
    const response = await fetchWithAuth(`/bottle-api/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<{
      codeMessage: string;
      message: string;
      userId: number;
      responseAt: string;
    }> = await response;

    return result;
  },
};
