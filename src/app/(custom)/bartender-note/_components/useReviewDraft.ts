import { useState } from 'react';
import { initialReview, type ReviewDraft } from './types';

/** 바텐더와 함께 쓰는 리뷰 초안. 작성 방식은 다음 리뷰에서도 먼저 권한다. */
export function useReviewDraft() {
  const [review, setReview] = useState<ReviewDraft>(initialReview);
  const [lastMode, setLastMode] = useState<ReviewDraft['mode']>('quick');

  const updateReview = (value: Partial<ReviewDraft>) =>
    setReview((current) => ({ ...current, ...value }));
  const chooseMode = (mode: ReviewDraft['mode']) => {
    updateReview({ mode });
    setLastMode(mode);
  };
  /** 같은 자리에서 다른 술을 기록한다. 장소와 작성 방식은 이어 쓴다. */
  const startAnother = () =>
    setReview({ ...initialReview, place: review.place, mode: lastMode });
  const reset = () => setReview(initialReview);
  const restore = (saved: ReviewDraft, savedMode: ReviewDraft['mode']) => {
    setReview(saved);
    setLastMode(savedMode);
  };

  return {
    review,
    updateReview,
    lastMode,
    chooseMode,
    startAnother,
    reset,
    restore,
  };
}
