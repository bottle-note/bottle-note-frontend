import { REVIEW_FILTER_TYPES, PICKS_STATUS } from '@/constants/history';
import type { InfiniteListParams } from '@/api/_shared/types';

export interface Rate {
  currentValue: string;
  ratingDiff?: string;
  prevValue?: string;
}

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
  dynamicMessage: Rate | null; // JSON으로 내려줌
}

export interface HistoryListApi {
  subscriptionDate: string;
  userHistories: History[];
}

export type HistoryListQueryParams = InfiniteListParams & {
  userId: string;
};

// 필터 관련 타입
export type ReviewFilterType = keyof typeof REVIEW_FILTER_TYPES;
export type PicksStatus = keyof typeof PICKS_STATUS;

export interface FilterState {
  ratingPoint: string[];
  historyReviewFilterType: ReviewFilterType[];
  picksStatus: PicksStatus[] | 'ALL';
  date: {
    startDate: Date | null;
    endDate: Date | null;
  };
  keyword: string;
}
