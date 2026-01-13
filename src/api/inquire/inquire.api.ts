import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import { transformServiceInquireList } from './transformers';
import type {
  InquireListParams,
  InquireQueryParams,
  InquirePostResponse,
  ServiceInquireListRaw,
  ServiceInquireListResponse,
  ServiceInquireDetailsResponse,
  BusinessInquireListResponse,
  BusinessInquireDetailsResponse,
} from './types';

export const InquireApi = {
  /**
   * 서비스 문의 목록을 조회합니다.
   * @param params - 페이지네이션 파라미터
   * @returns 문의 목록
   */
  async getInquireList(
    params: InquireListParams,
  ): Promise<ApiResponse<ServiceInquireListResponse>> {
    const { cursor, pageSize } = params;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<ServiceInquireListRaw>>(
      `/help?${queryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_FETCH_FAILED);
    }

    // 데이터 변환 적용
    const transformedData = transformServiceInquireList(response.data);

    return {
      ...response,
      data: transformedData,
    };
  },

  /**
   * 서비스 문의를 등록합니다.
   * @param params - 문의 내용
   * @returns 등록 결과
   */
  async registerInquire(
    params: InquireQueryParams,
  ): Promise<ApiResponse<InquirePostResponse>> {
    const response = await apiClient.post<ApiResponse<InquirePostResponse>>(
      `/help`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_CREATE_FAILED);
    }

    return response;
  },

  /**
   * 서비스 문의 상세 정보를 조회합니다.
   * @param helpId - 문의 ID
   * @returns 문의 상세 정보
   */
  async getInquireDetails(
    helpId: string | string[],
  ): Promise<ApiResponse<ServiceInquireDetailsResponse>> {
    const response = await apiClient.get<
      ApiResponse<ServiceInquireDetailsResponse>
    >(`/help/${helpId}`, { authRequired: true });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 비즈니스 문의 목록을 조회합니다.
   * @param params - 페이지네이션 파라미터
   * @returns 문의 목록
   */
  async getBusinessInquireList(
    params: InquireListParams,
  ): Promise<ApiResponse<BusinessInquireListResponse>> {
    const { cursor, pageSize } = params;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
    });

    const response = await apiClient.get<
      ApiResponse<BusinessInquireListResponse>
    >(`/business-support?${queryString}`, { authRequired: true });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 비즈니스 문의를 등록합니다.
   * @param params - 문의 내용
   * @returns 등록 결과
   */
  async registerBusinessInquire(
    params: InquireQueryParams,
  ): Promise<ApiResponse<InquirePostResponse>> {
    const response = await apiClient.post<ApiResponse<InquirePostResponse>>(
      `/business-support`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_CREATE_FAILED);
    }

    return response;
  },

  /**
   * 비즈니스 문의 상세 정보를 조회합니다.
   * @param businessHelpId - 문의 ID
   * @returns 문의 상세 정보
   */
  async getBusinessInquireDetails(
    businessHelpId: string | string[],
  ): Promise<ApiResponse<BusinessInquireDetailsResponse>> {
    const response = await apiClient.get<
      ApiResponse<BusinessInquireDetailsResponse>
    >(`/business-support/${businessHelpId}`, { authRequired: true });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.INQUIRE_FETCH_FAILED);
    }

    return response;
  },
};

export type { InquireListParams, InquireQueryParams } from './types';
