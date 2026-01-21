import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { S3UploadPath, PreSignedUrlResponse } from './types';

const S3_URL_PATH: Record<S3UploadPath, string> = {
  review: 'review',
  userProfile: 'user/profile',
  inquire: 'inquire',
} as const;

export const S3Api = {
  /**
   * S3 업로드용 Pre-signed URL을 발급받습니다.
   * @param type - 업로드 경로 유형
   * @param images - 업로드할 이미지 파일 배열
   * @returns Pre-signed URL 정보
   */
  async getUploadUrl(
    type: S3UploadPath,
    images: File[],
  ): Promise<ApiResponse<PreSignedUrlResponse>> {
    const queryString = buildQueryParams({
      rootPath: S3_URL_PATH[type],
      uploadSize: images.length,
    });

    const response = await apiClient.get<ApiResponse<PreSignedUrlResponse>>(
      `/s3/presign-url?${queryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.PRESIGNED_URL_FAILED);
    }

    return response;
  },
};

export type { S3UploadPath } from './types';
