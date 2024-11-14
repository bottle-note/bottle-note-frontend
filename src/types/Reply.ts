export interface Reply {
  userId: number;
  imageUrl: string;
  nickName: string;
  reviewReplyId: number;
  reviewReplyContent: string;
  createAt: string;
  status: 'NORMAL' | 'DELETED' | 'HIDDEN' | 'BLOCKED';
}

export interface RootReply extends Reply {
  subReplyCount: number;
}

export interface RootReplyListApi {
  reviewReplies: RootReply[];
  totalCount: number;
}

export interface SubReply extends Reply {
  rootReviewId: number;
  parentReviewReplyId: number;
  parentReviewReplyAuthor: string;
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

export interface ReplyPatchApi {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}
