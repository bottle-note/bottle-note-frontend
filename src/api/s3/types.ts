// ============================================
// S3 API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export type S3UploadPath =
  | 'review'
  | 'userProfile'
  | 'inquire'
  | 'tastingGraph';

export type AllowedContentType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/svg+xml'
  | 'video/mp4'
  | 'application/pdf';

// --------------- Response Types ---------------

export interface ImageUploadInfo {
  order: number;
  uploadUrl: string;
  viewUrl: string;
}

export interface PreSignedUrlResponse {
  bucketName: string;
  expiryTime: number;
  imageUploadInfo: ImageUploadInfo[];
  uploadSize: number;
}
