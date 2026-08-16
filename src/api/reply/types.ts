// ============================================
// Reply API - Request/Response Types
// ============================================

import type { InfiniteListParams } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type RootReplyListParams = InfiniteListParams & {
  reviewId: string;
};

export type SubReplyListParams = InfiniteListParams & {
  reviewId: string;
  rootReplyId: string;
};

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
}

export interface SubReply extends Reply {
  rootReviewId: number;
  parentReviewReplyId: number;
  parentReviewReplyAuthor: string;
}

export interface SubReplyListResponse {
  reviewReplies: SubReply[];
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
