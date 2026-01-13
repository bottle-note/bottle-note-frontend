import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  RootReplyListParams,
  SubReplyListParams,
  ReplyQueryParams,
  RootReplyListResponse,
  SubReplyListResponse,
  ReplyPostResponse,
  ReplyPatchResponse,
} from './types';

export const ReplyApi = {
  /**
   * 리뷰의 댓글 목록(루트 댓글)을 조회합니다.
   */
  async getRootReplyList(
    params: RootReplyListParams,
  ): Promise<ApiResponse<RootReplyListResponse>> {
    const { reviewId, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<RootReplyListResponse>>(
      `/review/reply/${reviewId}?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REPLY_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 대댓글 목록을 조회합니다.
   */
  async getSubReplyList(
    params: SubReplyListParams,
  ): Promise<ApiResponse<SubReplyListResponse>> {
    const { reviewId, rootReplyId } = params;

    const response = await apiClient.get<ApiResponse<SubReplyListResponse>>(
      `/review/reply/${reviewId}/sub/${rootReplyId}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REPLY_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 댓글을 등록합니다.
   */
  async registerReply(
    reviewId: string,
    params: ReplyQueryParams,
  ): Promise<ApiResponse<ReplyPostResponse>> {
    const response = await apiClient.post<ApiResponse<ReplyPostResponse>>(
      `/review/reply/register/${reviewId}`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REPLY_CREATE_FAILED);
    }

    return response;
  },

  /**
   * 댓글을 삭제합니다.
   */
  async deleteReply(
    reviewId: string,
    replyId: string,
  ): Promise<ApiResponse<ReplyPatchResponse>> {
    const response = await apiClient.delete<ApiResponse<ReplyPatchResponse>>(
      `/review/reply/${reviewId}/${replyId}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.REPLY_DELETE_FAILED);
    }

    return response;
  },
};

export type {
  RootReplyListParams,
  SubReplyListParams,
  ReplyQueryParams,
  RootReply,
  SubReply,
} from './types';
