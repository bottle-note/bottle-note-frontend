import { S3_URL_PATH } from '@/constants/common';
import { ApiResponse } from '@/types/common';
import { PreSignedApi } from '@/types/Image';
import { apiClient } from '@/shared/api/apiClient';

export const CommonApi = {
  async getUploadUrl(type: keyof typeof S3_URL_PATH, images: File[]) {
    const response = await apiClient.get<ApiResponse<PreSignedApi>>(
      `/s3/presign-url?rootPath=${S3_URL_PATH[type]}&uploadSize=${images.length}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response.data;
  },
};
