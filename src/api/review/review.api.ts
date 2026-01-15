import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import { transformReviewAlcoholInfo } from './transformers';
import type {
  ReviewListParams,
  ReviewQueryParams,
  LikeParams,
  VisibilityParams,
  ReviewListResponse,
  ReviewDetailsResponse,
  ReviewAlcoholInfoRaw,
  ReviewPostResponse,
  ReviewPatchResponse,
  ReviewLikeResponse,
  ReviewVisibilityResponse,
  Review,
} from './types';

export const ReviewApi = {
  /**
   * 위스키별 리뷰 목록을 조회합니다.
   */
  async getReviewList(
    params: ReviewListParams,
  ): Promise<ApiResponse<ReviewListResponse>> {
    const { alcoholId, sortType, sortOrder, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<ReviewListResponse>>(
      `/reviews/${alcoholId}?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 내 리뷰 목록을 조회합니다.
   */
  async getMyReviewList(
    params: ReviewListParams,
  ): Promise<ApiResponse<ReviewListResponse>> {
    const { alcoholId, sortType, sortOrder, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<ReviewListResponse>>(
      `/reviews/me/${alcoholId}?${queryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 리뷰 상세 정보를 조회합니다.
   */
  async getReviewDetails(
    reviewId: string | string[],
  ): Promise<ApiResponse<ReviewDetailsResponse>> {
    const response = await apiClient.get<
      ApiResponse<{
        alcoholInfo: ReviewAlcoholInfoRaw;
        reviewInfo: Review;
        reviewImageList: { order: number; viewUrl: string }[];
      }>
    >(`/reviews/detail/${reviewId}`, { authRequired: false });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_FETCH_FAILED);
    }

    // alcoholInfo 카테고리명 변환
    return {
      ...response,
      data: {
        ...response.data,
        alcoholInfo: transformReviewAlcoholInfo(response.data.alcoholInfo),
      },
    };
  },

  /**
   * 리뷰를 등록합니다.
   */
  async registerReview(
    params: ReviewQueryParams,
  ): Promise<ApiResponse<ReviewPostResponse>> {
    const response = await apiClient.post<ApiResponse<ReviewPostResponse>>(
      `/reviews`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_CREATE_FAILED);
    }

    return response;
  },

  /**
   * 리뷰를 수정합니다.
   */
  async modifyReview(
    reviewId: string,
    params: ReviewQueryParams,
  ): Promise<ApiResponse<ReviewPatchResponse>> {
    const response = await apiClient.patch<ApiResponse<ReviewPatchResponse>>(
      `/reviews/${reviewId}`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_UPDATE_FAILED);
    }

    return response;
  },

  /**
   * 리뷰를 삭제합니다.
   */
  async deleteReview(
    reviewId: string,
  ): Promise<ApiResponse<ReviewPatchResponse>> {
    const response = await apiClient.delete<ApiResponse<ReviewPatchResponse>>(
      `/reviews/${reviewId}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_DELETE_FAILED);
    }

    return response;
  },

  /**
   * 리뷰에 좋아요/취소합니다.
   */
  async putLike(params: LikeParams): Promise<ApiResponse<ReviewLikeResponse>> {
    const { reviewId, isLiked } = params;

    const response = await apiClient.put<ApiResponse<ReviewLikeResponse>>(
      `/likes`,
      {
        reviewId,
        status: isLiked ? 'LIKE' : 'DISLIKE',
      },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.LIKE_FAILED);
    }

    return response;
  },

  /**
   * 리뷰 공개/비공개 상태를 변경합니다.
   */
  async putVisibility(
    params: VisibilityParams,
  ): Promise<ApiResponse<ReviewVisibilityResponse>> {
    const { reviewId, status } = params;

    const response = await apiClient.patch<
      ApiResponse<ReviewVisibilityResponse>
    >(
      `/reviews/${reviewId}/display`,
      { reviewId, status },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REVIEW_UPDATE_FAILED);
    }

    return response;
  },
};

export type {
  ReviewListParams,
  ReviewQueryParams,
  Review,
  ReviewDetailsResponse,
} from './types';
