import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
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
    const response = await fetchWithAuth(
      `/bottle-api/reviews/${alcoholId}?sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      { requireAuth: false },
    );
    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewListApi> = await response;
    return result;
  },

  async getMyReviewList({
    alcoholId,
    sortType,
    sortOrder,
    cursor,
    pageSize,
  }: ListQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/reviews/me/${alcoholId}?sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewListApi> = await response;

    return result;
  },

  async getReviewDetails(reviewId: string | string[]) {
    const response = await fetchWithAuth(
      `/bottle-api/reviews/detail/${reviewId}`,
      { requireAuth: false },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{
      alcoholInfo: any;
      reviewInfo: any;
      reviewImageList: any[];
    }> = await response;

    const formattedResult: ApiResponse<ReviewDetailsApi> = {
      ...result,
      data: {
        ...result.data,
        alcoholInfo: {
          ...result.data.alcoholInfo,
          engCategory: result.data.alcoholInfo.engCategoryName,
          korCategory: result.data.alcoholInfo.korCategoryName,
        },
      },
    };

    return formattedResult.data;
  },

  async registerReview(params: ReviewQueryParams) {
    const response = await fetchWithAuth(`/bottle-api/reviews`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewPostApi> = await response;
    return result.data;
  },

  async modifyReview(reviewId: string, params: ReviewQueryParams) {
    const response = await fetchWithAuth(`/bottle-api/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewPatchApi> = await response;
    return result.data;
  },

  async deleteReview(reviewId: string) {
    const response = await fetchWithAuth(`/bottle-api/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewPatchApi> = await response;
    return result.data;
  },

  async putLike(reviewId: string | number, isLiked: boolean) {
    const response = await fetchWithAuth(`/bottle-api/likes`, {
      method: 'PUT',
      body: JSON.stringify({
        reviewId,
        status: isLiked ? 'LIKE' : 'DISLIKE',
      }),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReviewLikePutApi> = await response;
    return result.data;
  },

  async putVisibility(reviewId: string | number, status: 'PUBLIC' | 'PRIVATE') {
    const response = await fetchWithAuth(
      `/bottle-api/reviews/${reviewId}/display`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          reviewId,
          status,
        }),
      },
    );

    const result: ApiResponse<ReviewVisibilityPatchApi> = await response;
    return result.data;
  },
};
