export interface RootReply {
  userId: number;
  imageUrl: string;
  nickName: string;
  reviewReplyId: number;
  reviewReplyContent: string;
  subReplyCount: number;
  createAt: string;
}

export interface RootReplyListApi {
  reviewReplies: RootReply[];
  totalCount: number;
}

export interface SubReply {
  userId: number;
  imageUrl: string;
  nickName: string;
  rootReviewId: number;
  parentReviewReplyId: number;
  parentReviewReplyAuthor: string;
  reviewReplyId: number;
  reviewReplyContent: string;
  createAt: string;
}

export interface SubReplyListApi {
  reviewReplies: SubReply[];
  totalCount: number;
}

export interface ReplyQueryParams {
  content: string;
  parentReplyId?: string | null;
}

export interface ReplyPostApi {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}

export interface FormValues {
  content: string;
  parentReplyId?: string | null;
  replyToReplyUserName?: string | null;
}
