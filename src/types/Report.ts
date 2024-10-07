export interface Report {
  content: string;
  type: string;
}

export interface FormValues extends Report {
  reportUserId?: number;
}

export interface UserReportQueryParams extends Report {
  reportUserId: number;
}

export interface ReportPostApi {
  reportUserId: number;
  message: string;
  reportId: number;
  reportUserName: string;
}
