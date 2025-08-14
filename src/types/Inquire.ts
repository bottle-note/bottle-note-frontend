export interface FormValues {
  title: string;
  content: string;
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

type helpStatus = 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';

export interface InquireList {
  helpId: number;
  content: string;
  createAt: string;
  helpStatus: helpStatus;
}

export interface InquireListApi {
  helpList: InquireList[];
  totalCount: number;
}

export interface InquireDetailsApi {
  helpId: number;
  content: string;
  helpType: string;
  createAt: string;
  statusType: helpStatus;
  adminId: number;
  lastModifyAt: string;
  responseContent: string;
  imageUrlList: {
    order: number;
    viewUrl: string;
  }[];
}
