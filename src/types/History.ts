export interface HistoryApi {
  // API 확정 후 수정 필요
  historyId: number;
  createdAt: string;
  eventCategory: 'RATING' | 'REVIEW' | 'LIKE' | 'UNLIKE' | 'REPLY';
  eventType: string;
  alcoholId: number;
  rating?: number;
  reviewText?: string;
  korName: string;
  imageUrl: string;
  redirectUrl: string;
  description: string;
  message: string;
}
