import { SERVICE_TYPE_LIST, BUSINESS_TYPE_LIST } from '@/constants/Inquire';

export type ServiceType = (typeof SERVICE_TYPE_LIST)[number]['type'];
export type BusinessType = (typeof BUSINESS_TYPE_LIST)[number]['type'];
export type Status = 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';
export interface FormValues {
  title: string;
  content: string;
  contact?: string;
  type?: string;
  businessSupportType?: string;
  images?: { order: number; image: File }[] | null;
  imageUrlList?:
    | {
        order: number;
        viewUrl: string;
      }[]
    | null;
}

export type InquireQueryParams = Omit<FormValues, 'images'>;

export interface InquirePostApi {
  helpId: number;
  codeMessage: string;
  message: string;
  responseAt: string;
}

export interface InquireList {
  id: number;
  title: string;
  content: string;
  createAt: string;
  status: Status;
}

export interface ServiceInquireListApi {
  helpList: {
    helpId: number;
    title: string;
    content: string;
    createAt: string;
    helpStatus: Status;
  }[];
  totalCount: number;
}

export interface BusinessInquireListApi {
  items: InquireList[];
  totalCount: number;
}

interface InquireDetailsApi {
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

export interface ServiceInquireDetailsApi extends InquireDetailsApi {
  helpId: number;
  helpType: ServiceType;
  statusType: Status;
}

export interface BusinessInquireDetailsApi extends InquireDetailsApi {
  id: number;
  contact: string;
  businessSupportType: BusinessType;
  status: Status;
}

// Unified interface for inquire details
export interface UnifiedInquireDetails {
  id: string | number;
  title: string;
  content: string;
  createAt: string;
  status: string;
  type: string;
  typeName: string;
  adminId: number;
  lastModifyAt: string;
  responseContent: string;
  imageUrlList: { order: number; viewUrl: string }[];
}
