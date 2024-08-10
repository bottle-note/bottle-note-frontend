import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { PreSignedApi } from '@/types/Image';
import {
  ReviewDetailsApi,
  ReviewPostApi,
  ReviewQueryParams,
  ReviewPatchApi,
  ReviewLikePutApi,
  ReviewListApi,
} from '@/types/Review';
import { S3_URL_PATH } from '@/constants/common';

export const ReviewApi = {
  async getPreSignedURL(type: keyof typeof S3_URL_PATH, images: File[]) {
    const response = await fetchWithAuth(
      `/bottle-api/s3/presign-url?rootPath=${S3_URL_PATH[type]}&uploadSize=${images.length}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<PreSignedApi> = await response;
    return result.data;
  },

  async getReviewList({
    alcoholId,
    sortType,
    sortOrder,
    cursor,
    pageSize,
  }: ListQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/reviews/${alcoholId}?sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
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
    const response = await fetch(`/bottle-api/reviews/detail/${reviewId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{
      alcoholInfo: any;
      reviewResponse: any;
      reviewImageList: any[];
    }> = await response.json();

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
    // 주소 추가 후 타 적용 예정
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
        isLiked: isLiked ? 'LIKE' : 'DISLIKE',
      }),
    });

    const result: ApiResponse<ReviewLikePutApi> = await response.data;
    return result;
  },
};
