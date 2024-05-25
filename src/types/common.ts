export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  errors: any;
  meta: {
    serverEncoding: string;
    serverVersion: string;
    serverPathVersion: string;
    serverResponseTime: string;
  };
}
