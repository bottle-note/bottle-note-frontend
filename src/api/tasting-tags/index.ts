import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/types/common';
import type { ExtractTagsResponse } from './types';

export const TastingTagsApi = {
  /**
   * 리뷰 텍스트에서 플레이버 태그를 추출합니다.
   * @param text - 분석할 리뷰 텍스트
   * @returns 추출된 태그 배열
   */
  async extractTags(text: string): Promise<ExtractTagsResponse> {
    const response = await apiClient.get<ApiResponse<ExtractTagsResponse>>(
      `/tasting-tags/extract?text=${encodeURIComponent(text)}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error('태그 추출에 실패했습니다.');
    }

    return response.data;
  },
};
