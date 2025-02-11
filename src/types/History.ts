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
  | 'UNPICKED'
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
  description: string;
  message: string;
  dynamicMessage: Rate | null; // JSON으로 내려줌

  // reviewText?: string; -> API 추가 예정
  // korName: string;
}

export interface HistoryListApi {
  totalCount: number;
  subscriptionDate: string;
  userHistories: History[];
}
