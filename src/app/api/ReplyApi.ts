import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import {
  SubReplyListApi,
  ReplyQueryParams,
  ReplyPostApi,
  RootReplyListApi,
  ReplyPatchApi,
} from '@/types/Reply';

export const ReplyApi = {
  async getRootReplyList({ reviewId, cursor, pageSize }: ListQueryParams) {
    const response = await fetchWithAuth(
      // `/bottle-api/review/reply/${reviewId}`,
      `/bottle-api/review/reply/${reviewId}?cursor=${cursor}&pageSize=${pageSize}`,
    );
    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<RootReplyListApi> = await response;

    return result;
  },

  async getSubReplyList({ reviewId, rootReplyId }: ListQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/review/reply/${reviewId}/sub/${rootReplyId}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<SubReplyListApi> = await response;

    return result.data;
  },

  async registerReply(reviewId: string, params: ReplyQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/review/reply/register/${reviewId}`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReplyPostApi> = await response;
    return result.data;
  },

  async deleteReply(reviewId: string, replyId: string) {
    const response = await fetchWithAuth(
      `/bottle-api/review/reply/${reviewId}/${replyId}`,
      {
        method: 'DELETE',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<ReplyPatchApi> = await response;
    return result.data;
  },
};
