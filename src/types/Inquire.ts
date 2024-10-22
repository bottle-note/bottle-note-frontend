export interface FormValues {
  content: string;
  type: string;
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
  helpId: number;
  content: string;
  createAt: string;
  helpStatus: 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';
}

export interface InquireListApi {
  helpList: InquireList[];
  totalCount: number;
}
