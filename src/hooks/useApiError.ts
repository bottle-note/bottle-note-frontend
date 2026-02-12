import { ApiError } from '@/utils/ApiError';

interface ApiErrorInfo {
  /** HTTP 상태 코드 (ApiError가 아닌 경우 null) */
  status: number | null;
  /** 에러 원본 메시지 */
  message: string;
}

/**
 * API 에러 객체에서 HTTP 상태 코드와 메시지를 추출하는 훅
 *
 * @example
 * const { data, error } = useQuery(...);
 * const errorInfo = useApiError(error);
 *
 * if (errorInfo) {
 *   const isDeleted = errorInfo.status === 404;
 *   // errorInfo.status -> HTTP 상태 코드
 *   // errorInfo.message -> 에러 메시지
 * }
 */
export const useApiError = (
  error: Error | null | undefined,
): ApiErrorInfo | null => {
  if (!error) return null;

  const status = error instanceof ApiError ? error.response.status : null;

  return { status, message: error.message };
};
