import { ApiResponse, ListQueryParams } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import {
  InquirePostApi,
  InquireQueryParams,
  InquireListApi,
  InquireDetailsApi,
} from '@/types/Inquire';

export const InquireApi = {
  async getInquireList({ cursor, pageSize }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<InquireListApi>>(
      `/help?cursor=${cursor}&pageSize=${pageSize}`,
    );

    return response;
  },

  async registerInquire(params: InquireQueryParams) {
    const response = await apiClient.post<ApiResponse<InquirePostApi>>(
      `/help`,
      params,
    );

    return response.data;
  },

  async getInquireDetails(helpId: string | string[]) {
    const response = await apiClient.get<ApiResponse<InquireDetailsApi>>(
      `/help/${helpId}`,
    );

    return response.data;
  },

  async getBusinessInquireList({ cursor, pageSize }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<InquireListApi>>(
      `/business-support?cursor=${cursor}&pageSize=${pageSize}`,
    );

    return response;
  },

  async registerBusinessInquire(params: InquireQueryParams) {
    const response = await apiClient.post<ApiResponse<InquirePostApi>>(
      `/business-support`,
      params,
    );

    return response.data;
  },

  async getBusinessInquireDetails(businessHelpId: string | string[]) {
    const response = await apiClient.get<ApiResponse<InquireDetailsApi>>(
      `/business-support/${businessHelpId}`,
    );

    return response.data;
  },
};
