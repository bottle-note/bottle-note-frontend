// ============================================
// S3 API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export type S3UploadPath = 'review' | 'userProfile' | 'inquire';

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
