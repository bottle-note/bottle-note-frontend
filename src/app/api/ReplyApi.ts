import { ApiResponse, ListQueryParams } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import {
  SubReplyListApi,
  ReplyQueryParams,
  ReplyPostApi,
  RootReplyListApi,
  ReplyPatchApi,
} from '@/types/Reply';

export const ReplyApi = {
  async getRootReplyList({ reviewId, cursor, pageSize }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<RootReplyListApi>>(
      `/review/reply/${reviewId}?cursor=${cursor}&pageSize=${pageSize}`,
      { useAuth: false },
    );

    return response;
  },

  async getSubReplyList({ reviewId, rootReplyId }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<SubReplyListApi>>(
      `/review/reply/${reviewId}/sub/${rootReplyId}`,
      { useAuth: false },
    );

    return response.data;
  },

  async registerReply(reviewId: string, params: ReplyQueryParams) {
    const response = await apiClient.post<ApiResponse<ReplyPostApi>>(
      `/review/reply/register/${reviewId}`,
      params,
    );

    return response.data;
  },

  async deleteReply(reviewId: string, replyId: string) {
    const response = await apiClient.delete<ApiResponse<ReplyPatchApi>>(
      `/review/reply/${reviewId}/${replyId}`,
    );

    return response.data;
  },
};
