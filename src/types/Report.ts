export interface Report {
  content: string;
  type: string;
}

export interface FormValues extends Report {
  reportUserId?: number;
  reportReviewId?: number;
}

export interface UserReportQueryParams extends Report {
  reportUserId: number;
}

export interface ReviewReportQueryParams extends Report {
  reportReviewId: number;
}

export interface ReportPostApi {
  message: string;
}

export interface UserReportPostApi extends ReportPostApi {
  reportUserId: number;
  reportId: number;
  reportUserName: string;
}

export interface ReviewReportPostApi extends ReportPostApi {
  success: boolean;
  responseAt: string;
}

export interface ReportTypeMap {
  user: {
    params: UserReportQueryParams;
    response: UserReportPostApi;
  };
  review: {
    params: ReviewReportQueryParams;
    response: ReviewReportPostApi;
  };
  comment: { params: ''; response: '' }; // 추후 추가될 타입(아직 API 없음)
}
