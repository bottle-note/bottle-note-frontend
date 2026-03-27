import { S3Api, type AllowedContentType } from '@/api/s3/s3.api';
import { S3_URL_PATH } from '@/constants/common';

export async function uploadImages(
  type: keyof typeof S3_URL_PATH,
  images: File | File[],
) {
  const imageArray = Array.isArray(images) ? images : [images];

  const results = await Promise.all(
    imageArray.map(async (file) => {
      const contentType = (file.type || 'image/jpeg') as AllowedContentType;
      const response = await S3Api.getUploadUrl(type, 1, contentType);
      const info = response.data.imageUploadInfo[0];

      await fetch(info.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const { uploadUrl, ...rest } = info;
      return rest;
    }),
  );

  return results;
}
