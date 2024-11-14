import { StaticImageData } from 'next/image';

export interface PreSignedApi {
  bucketName: string;
  expiryTime: number;
  imageUploadInfo: {
    order: number;
    uploadUrl: string;
    viewUrl: string;
  }[];
  uploadSize: number;
}

export interface SaveImages {
  order: number;
  image: string;
}

export interface CategoryImage {
  imgSrc: StaticImageData;
  imageSize: { width: number; height: number };
}
