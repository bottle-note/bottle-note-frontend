// ============================================
// Inquire API - Data Transformers
// ============================================

import type {
  ServiceInquireListRaw,
  ServiceInquireListResponse,
  InquireListItem,
} from './types';

/**
 * 서비스 문의 목록 API 응답을 표준 형식으로 변환합니다.
 * @param raw - API 원본 응답
 * @returns 변환된 응답
 */
export function transformServiceInquireList(
  raw: ServiceInquireListRaw,
): ServiceInquireListResponse {
  const items: InquireListItem[] = raw.helpList.map((inquiry) => ({
    id: inquiry.helpId,
    title: inquiry.title,
    content: inquiry.content,
    createAt: inquiry.createAt,
    status: inquiry.helpStatus,
  }));

  return {
    items,
    totalCount: raw.totalCount,
  };
}
