import { ReactNode } from 'react';
import { truncStr } from '@/utils/truncStr';
import { Rate } from '@/types/History';

export interface HistoryTypeInfo {
  getIcon: (rate?: Rate | null) => string;
  iconAlt: string;
  renderDescription?: (rate?: Rate | null, description?: string) => ReactNode;
}

export const HISTORY_TYPE_INFO: Record<string, HistoryTypeInfo> = {
  START_RATING: {
    getIcon: () => '/icon/history/pick_filled_subcoral.svg',
    iconAlt: '별점 추가 아이콘',
    renderDescription: (rate?: Rate | null) => (
      <div className="flex items-center">
        <p className="text-12 text-mainGray">
          <strong>별점 {rate?.currentValue}점</strong>을 주셨어요.
        </p>
      </div>
    ),
  },
  RATING_MODIFY: {
    getIcon: (rate?: Rate | null) => {
      if (!rate?.ratingDiff) return '/icon/history/pick_filled_subcoral.svg';

      const ratingDiffStr = rate.ratingDiff.toString();

      if (ratingDiffStr.startsWith('-')) {
        return '/icon/history/rating_filled_blue.svg';
      }
      return '/icon/history/rating_filled_red.svg';
    },
    iconAlt: '별점 수정 아이콘',
    renderDescription: (rate?: Rate | null) => {
      const ratingDiffStr = rate?.ratingDiff?.toString();
      const isNegative = ratingDiffStr?.startsWith('-');
      const ratingValue = isNegative ? ratingDiffStr?.slice(1) : ratingDiffStr;
      return (
        <div className="flex items-center">
          <p className="text-mainGray text-12 mr-1">
            <strong>별점 {rate?.currentValue}점</strong>을 주셨어요.
          </p>
          {/* 뭐가 무제인지 모르겠지만 tailwindcss가 적용되지 않는다. 추후 파보기 */}
          {isNegative ? (
            <p
              style={{ color: '#0087E9', fontSize: '9px' }}
            >{` (${ratingValue}▼)`}</p>
          ) : (
            <p
              style={{ color: '#FF6450', fontSize: '9px' }}
            >{` (${ratingValue}▲)`}</p>
          )}
        </div>
      );
    },
  },
  RATING_DELETE: {
    getIcon: () => '/icon/history/rating_unfilled_subcoral.svg',
    iconAlt: '별점 삭제 아이콘',
    renderDescription: () => (
      <div className="flex items-center">
        <p className="text-12 text-mainGray">
          <strong>별점삭제</strong>를 하셨어요.
        </p>
      </div>
    ),
  },
  REVIEW_CREATE: {
    getIcon: () => '/icon/history/review_subcoral.svg',
    iconAlt: '리뷰 작성 아이콘',
    renderDescription: (rate?: Rate | null, description?: string) => (
      <p className="text-12 text-mainGray">
        <strong>[{description && truncStr(description, 7)}]리뷰를</strong>{' '}
        작성했어요!
      </p>
    ),
  },
  REVIEW_LIKES: {
    getIcon: () => '/icon/history/like_unfilled_subcoral.svg',
    iconAlt: '리뷰 좋아요 아이콘',
    renderDescription: (rate?: Rate | null, description?: string) => (
      <p className="text-12 text-mainGray">
        <strong>
          [{description && truncStr(description, 7)}]리뷰에 좋아요
        </strong>
        를 했어요.
      </p>
    ),
  },
  BEST_REVIEW_SELECTED: {
    getIcon: () => '/icon/history/review_white.svg',
    iconAlt: '베스트 리뷰 아이콘',
    renderDescription: (rate?: Rate | null, description?: string) => (
      <p className="text-12 text-mainGray">
        <strong>
          [{description && truncStr(description, 7)}]베스트 리뷰가 됐어요!
        </strong>
      </p>
    ),
  },
  REVIEW_REPLY_CREATE: {
    getIcon: () => '/icon/history/review_subcoral.svg',
    iconAlt: '리뷰 댓글 작성 아이콘',
    renderDescription: (rate?: Rate | null, description?: string) => (
      <p className="text-12 text-mainGray">
        <strong>[{description && truncStr(description, 7)}]리뷰에 댓글</strong>
        을 작성했어요!
      </p>
    ),
  },
  UNPICKED: {
    getIcon: () => '/icon/history/pick_unfilled_subcoral.svg',
    iconAlt: '찜해제 아이콘',
    renderDescription: () => (
      <p className="text-12 text-mainGray">
        <strong>찜하기 해제</strong> 하셨어요.
      </p>
    ),
  },
  IS_PICK: {
    getIcon: () => '/icon/history/pick_filled_subcoral.svg',
    iconAlt: '찜하기 아이콘',
    renderDescription: () => (
      <p className="text-12 text-mainGray">
        <strong>찜하기</strong> 하셨어요.
      </p>
    ),
  },
  BOTTLE: {
    getIcon: () => '/icon/history/bottle-filled-subcoral.svg',
    iconAlt: '보틀노트 아이콘',
  },
} as const;
