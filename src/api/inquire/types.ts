// ============================================
// Inquire API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface InquireQueryParams {
  title: string;
  content: string;
  contact?: string;
  type?: string;
  businessSupportType?: string;
  imageUrlList?:
    | {
        order: number;
        viewUrl: string;
      }[]
    | null;
}

export interface InquireListParams {
  cursor?: number;
  pageSize?: number;
}

// --------------- Response Types ---------------

export type InquireStatus = 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';

export interface InquirePostResponse {
  helpId: number;
  codeMessage: string;
  message: string;
  responseAt: string;
}

export interface InquireListItem {
  id: number;
  title: string;
  content: string;
  createAt: string;
  status: InquireStatus;
}

// 하위 호환성을 위한 alias
export type ServiceInquireItem = InquireListItem;

// 서비스 문의 관련
export interface ServiceInquireListRaw {
  helpList: {
    helpId: number;
    title: string;
    content: string;
    createAt: string;
    helpStatus: InquireStatus;
  }[];
  totalCount: number;
}

export interface ServiceInquireListResponse {
  items: InquireListItem[];
  totalCount: number;
}

export interface ServiceInquireDetailsResponse {
  helpId: number;
  helpType: string;
  statusType: InquireStatus;
  title: string;
  content: string;
  createAt: string;
  adminId: number;
  lastModifyAt: string;
  responseContent: string;
  imageUrlList: {
    order: number;
    viewUrl: string;
  }[];
}

// 비즈니스 문의 관련
export interface BusinessInquireListResponse {
  items: InquireListItem[];
  totalCount: number;
}

export interface BusinessInquireDetailsResponse {
  id: number;
  contact: string;
  businessSupportType: string;
  status: InquireStatus;
  title: string;
  content: string;
  createAt: string;
  adminId: number;
  lastModifyAt: string;
  responseContent: string;
  imageUrlList: {
    order: number;
    viewUrl: string;
  }[];
}
