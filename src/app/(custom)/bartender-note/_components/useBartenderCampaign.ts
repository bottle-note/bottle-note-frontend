import { useRef } from 'react';
import {
  trackCampaignEvent,
  type CampaignCode,
} from '@/api/campaign-content/campaign-content.api';
import type { ReviewEntryFlow } from '@/utils/analytics/types';

/** 바텐더 노트가 어드민 캠페인 지표로 재는 세 흐름 */
export type BartenderCampaign = 'recommend' | 'curation' | 'review';

const CAMPAIGN_CODE: Record<BartenderCampaign, CampaignCode> = {
  recommend: 'bartender-note-recommend',
  curation: 'bartender-note-curation',
  review: 'bartender-note-review',
};

type Milestone = 'FINISH' | 'RESULT';

/** 진행 중인 시도와 그 시도에서 이미 보낸 이벤트 */
export interface CampaignAttempt {
  campaign: BartenderCampaign;
  sent: Milestone[];
}

/** 추천·큐레이션 시도와 별도로 진행하는 리뷰. 로그인 전에 시작하면 술을 아직 고르지 않았을 수 있다. */
export interface ReviewCampaignAttempt {
  entryFlow: ReviewEntryFlow;
  alcoholId: number | null;
  sent: Milestone[];
}

/**
 * 추천·큐레이션과 리뷰의 캠페인 시도를 독립적으로 유지한다.
 * 추천에서 리뷰를 쓰더라도 원래 추천 시도는 닫지 않는다.
 * 시도는 스냅샷에 남겨 새로고침·로그인 왕복 뒤에도 같은 완료·결과를 다시 보내지 않는다.
 */
export function useBartenderCampaign() {
  const attempt = useRef<CampaignAttempt | null>(null);
  const reviewAttempt = useRef<ReviewCampaignAttempt | null>(null);

  const startReview = (
    entryFlow: ReviewEntryFlow,
    alcoholId: number | null = null,
  ) => {
    const current = reviewAttempt.current;
    // 같은 리뷰 재진입은 새 시도가 아니다. 직접 진입에서는 검색 후 고른 술만 채운다.
    if (
      current &&
      (current.alcoholId === null || current.alcoholId === alcoholId)
    ) {
      reviewAttempt.current = { ...current, alcoholId };
      return;
    }
    reviewAttempt.current = { entryFlow, alcoholId, sent: [] };
    trackCampaignEvent(CAMPAIGN_CODE.review, 'START');
  };

  return {
    /** 첫 화면에서 세 흐름을 모두 보여 주므로 새 진입에 세 코드로 보낸다. */
    view: () => {
      Object.values(CAMPAIGN_CODE).forEach((code) =>
        trackCampaignEvent(code, 'VIEW'),
      );
    },
    /** 첫 화면에서 고른 새 흐름. 이전 흐름과 리뷰 시도를 함께 닫는다. */
    start: (campaign: BartenderCampaign | null) => {
      attempt.current =
        campaign && campaign !== 'review' ? { campaign, sent: [] } : null;
      reviewAttempt.current = null;
      if (campaign === 'review') startReview('direct');
      else if (campaign) trackCampaignEvent(CAMPAIGN_CODE[campaign], 'START');
    },
    /** 술 상세에서 리뷰로 이어질 때는 원래 흐름을 보존한다. 로그인 안내 전 호출한다. */
    startReview,
    /** 각 캠페인 시도에서 완료·결과를 한 번만 보낸다. */
    reach: (campaign: BartenderCampaign, milestone: Milestone) => {
      if (campaign === 'review') {
        const current = reviewAttempt.current;
        if (!current || current.sent.includes(milestone)) return;
        reviewAttempt.current = {
          ...current,
          sent: [...current.sent, milestone],
        };
      } else {
        const current = attempt.current;
        if (current?.campaign !== campaign || current.sent.includes(milestone))
          return;
        attempt.current = { campaign, sent: [...current.sent, milestone] };
      }
      trackCampaignEvent(CAMPAIGN_CODE[campaign], milestone);
    },
    end: () => {
      attempt.current = null;
      reviewAttempt.current = null;
    },
    current: () => attempt.current,
    currentReview: () => reviewAttempt.current,
    reviewEntryFlow: () => reviewAttempt.current?.entryFlow,
    restore: (
      saved: CampaignAttempt | null | undefined,
      savedReview: ReviewCampaignAttempt | null | undefined,
    ) => {
      attempt.current = saved?.campaign === 'review' ? null : saved ?? null;
      // 업데이트 전 직접 리뷰를 시작한 스냅샷의 완료·결과도 보존한다.
      reviewAttempt.current =
        savedReview ??
        (saved?.campaign === 'review'
          ? { entryFlow: 'direct', alcoholId: null, sent: saved.sent }
          : null);
    },
  };
}
