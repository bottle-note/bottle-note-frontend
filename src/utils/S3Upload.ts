import { S3Api } from '@/api/s3/s3.api';
import { S3_URL_PATH } from '@/constants/common';

export async function uploadImages(
  type: keyof typeof S3_URL_PATH,
  images: File | File[],
) {
  const imageArray = Array.isArray(images) ? images : [images];

  // GET preSignedURL
  const response = await S3Api.getUploadUrl(type, imageArray);
  const preSignedData = response.data;

  // Upload images
  const uploadPromises = imageArray.map((image, index) => {
    const url = preSignedData.imageUploadInfo[index].uploadUrl;
    return fetch(url, {
      method: 'PUT',
      body: image,
      headers: {
        'Content-Type': image.type,
      },
    });
  });

  await Promise.all(uploadPromises);

  const PreSignedDBData = preSignedData.imageUploadInfo.map(
    ({ uploadUrl, ...rest }) => rest,
  );

  return PreSignedDBData;
}
