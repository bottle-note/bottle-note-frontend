import { ApiResponse, ListQueryParams } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import {
  ReviewDetailsApi,
  ReviewPostApi,
  ReviewQueryParams,
  ReviewPatchApi,
  ReviewLikePutApi,
  ReviewListApi,
  ReviewVisibilityPatchApi,
} from '@/types/Review';

export const ReviewApi = {
  async getReviewList({
    alcoholId,
    sortType,
    sortOrder,
    cursor,
    pageSize,
  }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<ReviewListApi>>(
      `/reviews/${alcoholId}?sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response;
  },

  async getMyReviewList({
    alcoholId,
    sortType,
    sortOrder,
    cursor,
    pageSize,
  }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<ReviewListApi>>(
      `/reviews/me/${alcoholId}?sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response;
  },

  async getReviewDetails(reviewId: string | string[]) {
    const response = await apiClient.get<
      ApiResponse<{
        alcoholInfo: any;
        reviewInfo: any;
        reviewImageList: any[];
      }>
    >(`/reviews/detail/${reviewId}`, { authRequired: false });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const formattedResult: ApiResponse<ReviewDetailsApi> = {
      ...response,
      data: {
        ...response.data,
        alcoholInfo: {
          ...response.data.alcoholInfo,
          engCategory: response.data.alcoholInfo.engCategoryName,
          korCategory: response.data.alcoholInfo.korCategoryName,
        },
      },
    };

    return formattedResult.data;
  },

  async registerReview(params: ReviewQueryParams) {
    const response = await apiClient.post<ApiResponse<ReviewPostApi>>(
      `/reviews`,
      params,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewPostApi> = await response;
    return result.data;
  },

  async modifyReview(reviewId: string, params: ReviewQueryParams) {
    const response = await apiClient.patch<ApiResponse<ReviewPatchApi>>(
      `/reviews/${reviewId}`,
      params,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response.data;
  },

  async deleteReview(reviewId: string) {
    const response = await apiClient.delete<ApiResponse<ReviewPatchApi>>(
      `/reviews/${reviewId}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response.data;
  },

  async putLike(reviewId: string | number, isLiked: boolean) {
    const response = await apiClient.put<ApiResponse<ReviewLikePutApi>>(
      `/likes`,
      {
        reviewId,
        status: isLiked ? 'LIKE' : 'DISLIKE',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response.data;
  },

  async putVisibility(reviewId: string | number, status: 'PUBLIC' | 'PRIVATE') {
    const response = await apiClient.patch<
      ApiResponse<ReviewVisibilityPatchApi>
    >(`/reviews/${reviewId}/display`, {
      reviewId,
      status,
    });

    return response.data;
  },
};
