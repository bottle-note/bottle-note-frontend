import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse, CursorPaginationParams } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { CurationV2SpecCode } from './constants';
import type { CurationV2DetailItem, CurationV2FeedData } from './types';

interface CurationV2FeedParams extends CursorPaginationParams {
  keyword?: string;
  code?: CurationV2SpecCode;
}

export const CurationV2Api = {
  /**
   * Product 피드 화면에서 사용할 spec 기반 큐레이션 v2 목록을 조회합니다.
   * - API docs: GET /api/v2/curations/feed
   * - payload는 responseSpec의 x-feed.enabled=true 필드만 포함합니다.
   */
  async getFeed(
    params: CurationV2FeedParams = {},
  ): Promise<ApiResponse<CurationV2FeedData>> {
    const { cursor = 0, pageSize = 10, keyword, code } = params;
    const queryString = buildQueryParams({
      cursor,
      size: pageSize,
      keyword,
      code,
    });

    const response = await apiClient.get<ApiResponse<CurationV2FeedData>>(
      `/curations/feed?${queryString}`,
      { authRequired: false, baseUrl: 'bottle-api/v2' },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.CURATION_FETCH_FAILED);
    }

    return response;
  },

  async getDetail(
    curationId: string | number,
  ): Promise<ApiResponse<CurationV2DetailItem>> {
    const response = await apiClient.get<ApiResponse<CurationV2DetailItem>>(
      `/curations/${curationId}`,
      { authRequired: false, baseUrl: 'bottle-api/v2' },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.CURATION_FETCH_FAILED);
    }

    return response;
  },
};
