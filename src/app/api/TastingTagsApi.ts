import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/types/common';

export const TastingTagsApi = {
  async extractTags(text: string) {
    const response = await apiClient.get<ApiResponse<string[]>>(
      `/tasting-tags/extract?text=${encodeURIComponent(text)}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('태그 추출에 실패했습니다.');
    }

    return response.data;
  },
};
