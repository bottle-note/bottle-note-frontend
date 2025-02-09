import { ReactNode } from 'react';
import { truncStr } from '@/utils/truncStr';

export interface HistoryTypeInfo {
  icon: string;
  iconAlt: string;
  renderDescription?: (rating?: number, description?: string) => ReactNode;
}

// API 확정 후 수정 필요
export const HISTORY_TYPE_INFO: Record<string, HistoryTypeInfo> = {
  RATING: {
    icon: '/icon/history/pick_filled_subcoral.svg',
    iconAlt: '별점 아이콘',
    renderDescription: (rating?: number) => (
      <div className="flex items-center">
        <p className="text-12 text-mainGray">별점 {rating}점을 주셨어요.</p>
      </div>
    ),
  },
  REVIEW: {
    icon: '/icon/history/review_subcoral.svg',
    iconAlt: '리뷰 아이콘',
    renderDescription: (rating?: number, description?: string) => (
      <p className="text-12 text-mainGray">
        [{description && truncStr(description, 7)}]에 리뷰를 작성했어요!
      </p>
    ),
  },
  BOTTLE: {
    icon: '/icon/history/bottle-filled-subcoral.svg',
    iconAlt: '보틀노트 아이콘',
  },
} as const;
