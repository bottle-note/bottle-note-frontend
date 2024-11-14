import { S3_URL_PATH } from '@/constants/common';
import { ApiResponse } from '@/types/common';
import { PreSignedApi } from '@/types/Image';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const CommonApi = {
  async getUploadUrl(type: keyof typeof S3_URL_PATH, images: File[]) {
    const response = await fetchWithAuth(
      `/bottle-api/s3/presign-url?rootPath=${S3_URL_PATH[type]}&uploadSize=${images.length}`,
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<PreSignedApi> = await response;
    return result.data;
  },
};
