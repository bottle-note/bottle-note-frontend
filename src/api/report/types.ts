// ============================================
// Report API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface UserReportParams {
  reportUserId: number;
  content: string;
  type: string;
}

export interface ReviewReportParams {
  reportReviewId: number;
  content: string;
  type: string;
}

// --------------- Response Types ---------------

export interface UserReportResponse {
  message: string;
  reportUserId: number;
  reportId: number;
  reportUserName: string;
}

export interface ReviewReportResponse {
  message: string;
  success: boolean;
  responseAt: string;
}

// --------------- Type Map ---------------

export type ReportEndpoint = 'user' | 'review' | 'comment';

export interface ReportTypeMap {
  user: {
    params: UserReportParams;
    response: UserReportResponse;
  };
  review: {
    params: ReviewReportParams;
    response: ReviewReportResponse;
  };
  comment: {
    params: unknown;
    response: unknown;
  };
}
