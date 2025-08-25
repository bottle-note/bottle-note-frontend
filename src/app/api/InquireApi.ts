import { ApiResponse, ListQueryParams } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import {
  InquirePostApi,
  InquireQueryParams,
  ServiceInquireListApi,
  BusinessInquireListApi,
  ServiceInquireDetailsApi,
  BusinessInquireDetailsApi,
} from '@/types/Inquire';

export const InquireApi = {
  async getInquireList({ cursor, pageSize }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<ServiceInquireListApi>>(
      `/help?cursor=${cursor}&pageSize=${pageSize}`,
    );

    const inquiries = response.data.helpList.map((inquiry) => ({
      id: inquiry.helpId,
      title: inquiry.title,
      content: inquiry.content,
      createAt: inquiry.createAt,
      status: inquiry.helpStatus,
    }));

    return {
      ...response,
      data: {
        items: inquiries,
        totalCount: response.data.totalCount,
      },
    };
  },

  async registerInquire(params: InquireQueryParams) {
    const response = await apiClient.post<ApiResponse<InquirePostApi>>(
      `/help`,
      params,
    );

    return response.data;
  },

  async getInquireDetails(helpId: string | string[]) {
    const response = await apiClient.get<ApiResponse<ServiceInquireDetailsApi>>(
      `/help/${helpId}`,
    );

    return response.data;
  },

  async getBusinessInquireList({ cursor, pageSize }: ListQueryParams) {
    const response = await apiClient.get<ApiResponse<BusinessInquireListApi>>(
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
    const response = await apiClient.get<
      ApiResponse<BusinessInquireDetailsApi>
    >(`/business-support/${businessHelpId}`);

    return response.data;
  },
};
