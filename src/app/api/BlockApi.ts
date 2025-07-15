import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { BlockListApi } from '@/types/Settings';

export const BlockApi = {
  async getBlockList() {
    const response = await fetchWithAuth(`/bottle-api/blocks`);
    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    console.log('차단 목록 조회 성공:', response.data);

    const result: ApiResponse<BlockListApi> = await response;

    return result;
  },

  // async getSubReplyList({ reviewId, rootReplyId }: ListQueryParams) {
  //   const response = await fetchWithAuth(
  //     `/bottle-api/review/reply/${reviewId}/sub/${rootReplyId}`,
  //     { requireAuth: false },
  //   );

  //   if (response.errors.length !== 0) {
  //     throw new Error('Failed to fetch data');
  //   }

  //   const result: ApiResponse<SubReplyListApi> = await response;

  //   return result.data;
  // },

  // async registerReply(reviewId: string, params: ReplyQueryParams) {
  //   const response = await fetchWithAuth(
  //     `/bottle-api/review/reply/register/${reviewId}`,
  //     {
  //       method: 'POST',
  //       body: JSON.stringify(params),
  //     },
  //   );

  //   if (response.errors.length !== 0) {
  //     throw new Error('Failed to fetch data');
  //   }

  //   const result: ApiResponse<ReplyPostApi> = await response;
  //   return result.data;
  // },

  // async deleteReply(reviewId: string, replyId: string) {
  //   const response = await fetchWithAuth(
  //     `/bottle-api/review/reply/${reviewId}/${replyId}`,
  //     {
  //       method: 'DELETE',
  //     },
  //   );

  //   if (response.errors.length !== 0) {
  //     throw new Error('Failed to fetch data');
  //   }

  //   const result: ApiResponse<ReplyPatchApi> = await response;
  //   return result.data;
  // },
};
