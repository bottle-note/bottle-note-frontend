import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const CommonApi = {
  async getUploadUrl({
    rootPath = 'test',
    uploadSize = 1,
  }: {
    rootPath?: string;
    uploadSize?: number;
  }) {
    const response = await fetchWithAuth(
      `/bottle-api/s3/presign-url?rootPath=${rootPath}&uploadSize=${uploadSize}`,
    );

    const { data } = await response.json();
    return data.accessToken;
  },
};
