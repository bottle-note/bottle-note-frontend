// ============================================
// Inquire API - Request/Response Types
// ============================================

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

export type ServiceInquireItem = InquireListItem;

export interface ServiceInquireListRaw {
  helpList: {
    helpId: number;
    title: string;
    content: string;
    createAt: string;
    helpStatus: InquireStatus;
  }[];
}

export interface ServiceInquireListResponse {
  items: InquireListItem[];
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

export interface BusinessInquireListResponse {
  items: InquireListItem[];
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
