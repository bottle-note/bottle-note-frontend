// ============================================
// Reply API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface RootReplyListParams {
  reviewId: string;
  cursor?: number;
  pageSize?: number;
}

export interface SubReplyListParams {
  reviewId: string;
  rootReplyId: string;
}

export interface ReplyQueryParams {
  content: string;
  parentReplyId?: string | null;
}

// --------------- Response Types ---------------

export type ReplyStatus = 'NORMAL' | 'DELETED' | 'HIDDEN' | 'BLOCKED';

export interface Reply {
  userId: number;
  imageUrl: string;
  nickName: string;
  reviewReplyId: number;
  reviewReplyContent: string;
  createAt: string;
  status: ReplyStatus;
}

export interface RootReply extends Reply {
  subReplyCount: number;
}

export interface RootReplyListResponse {
  reviewReplies: RootReply[];
  totalCount: number;
}

export interface SubReply extends Reply {
  rootReviewId: number;
  parentReviewReplyId: number;
  parentReviewReplyAuthor: string;
}

export interface SubReplyListResponse {
  reviewReplies: SubReply[];
  totalCount: number;
}

export interface ReplyPostResponse {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}

export interface ReplyPatchResponse {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}
