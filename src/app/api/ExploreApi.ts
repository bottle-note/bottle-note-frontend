import { ApiResponse, ListQueryParams } from '@/types/common';
import { ExploreAlcohol, ExploreReview } from '@/types/Explore';
import { apiClient } from '@/shared/api/apiClient';

export const ExploreApi = {
  async getReviews({
    keywords,
    cursor,
    pageSize,
  }: ListQueryParams & { keywords: string[] }) {
    const response = await apiClient.get<
      ApiResponse<{ items: ExploreReview[] }>
    >(
      `/reviews/explore/standard?keywords=${keywords.join('&keywords=')}&cursor=${cursor}&size=${pageSize}`,
      { authRequired: false },
    );

    return response;
  },
  async getAlcohols({
    keywords,
    cursor,
    pageSize,
  }: ListQueryParams & { keywords: string[] }) {
    const response = await apiClient.get<
      ApiResponse<{ items: ExploreAlcohol[] }>
    >(
      `/alcohols/explore/standard?keywords=${keywords.join('&keywords=')}&cursor=${cursor}&size=${pageSize}`,
      { authRequired: false },
    );

    return response;
  },
};
