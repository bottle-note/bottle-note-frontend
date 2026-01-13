// ============================================
// History API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface HistoryListQueryParams {
  userId: string;
  cursor?: number;
  pageSize?: number;
}

// --------------- Response Types ---------------

export type HistoryCategoryType = 'RATING' | 'REVIEW' | 'PICK';

export type HistoryEventType =
  | 'REVIEW_CREATE'
  | 'REVIEW_LIKES'
  | 'REVIEW_REPLY_CREATE'
  | 'BEST_REVIEW_SELECTED'
  | 'IS_PICK'
  | 'UNPICK'
  | 'START_RATING'
  | 'RATING_MODIFY'
  | 'RATING_DELETE';

export interface HistoryRate {
  currentValue: string;
  ratingDiff?: string;
  prevValue?: string;
}

export interface History {
  historyId: number;
  createdAt: string;
  eventCategory: HistoryCategoryType;
  eventType: HistoryEventType;
  alcoholId: number;
  alcoholName: string;
  imageUrl: string;
  redirectUrl: string;
  content: string;
  message: string;
  dynamicMessage: HistoryRate | null;
}

export interface HistoryListResponse {
  totalCount: number;
  subscriptionDate: string;
  userHistories: History[];
}
