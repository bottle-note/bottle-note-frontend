import { useRef } from 'react';
import {
  trackCampaignEvent,
  type CampaignCode,
} from '@/api/campaign-content/campaign-content.api';

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

/**
 * 어드민 캠페인 지표(조회·시작·완료·결과).
 * 흐름을 고르면(START) 그 흐름이 진행 중인 시도가 되고, 완료·결과는 진행 중인 흐름의 것만 시도당 한 번 보낸다.
 * 그래서 추천 상세에서 이어 쓴 리뷰는 리뷰 캠페인에 잡히지 않고, 다른 술 상세를 더 봐도 결과가 늘지 않는다.
 * 시도는 스냅샷에 남겨 새로고침·로그인 왕복 뒤에도 다시 보내지 않는다.
 */
export function useBartenderCampaign() {
  const attempt = useRef<CampaignAttempt | null>(null);

  return {
    /** 바텐더 노트에 새로 들어왔을 때. 첫 화면에서 세 흐름을 모두 보여 주므로 세 코드에 보낸다. */
    view: () => {
      Object.values(CAMPAIGN_CODE).forEach((code) =>
        trackCampaignEvent(code, 'VIEW'),
      );
    },
    /** 새 시도를 연다. 측정하지 않는 흐름(찜한 술 보기)은 null로 진행 중인 시도를 닫는다. */
    start: (campaign: BartenderCampaign | null) => {
      attempt.current = campaign ? { campaign, sent: [] } : null;
      if (campaign) trackCampaignEvent(CAMPAIGN_CODE[campaign], 'START');
    },
    /** 진행 중인 시도가 campaign이면 그 시도에서 한 번만 보낸다. */
    reach: (campaign: BartenderCampaign, milestone: Milestone) => {
      const current = attempt.current;
      if (current?.campaign !== campaign || current.sent.includes(milestone))
        return;
      attempt.current = { campaign, sent: [...current.sent, milestone] };
      trackCampaignEvent(CAMPAIGN_CODE[campaign], milestone);
    },
    end: () => {
      attempt.current = null;
    },
    /** 스냅샷에 남길 진행 중인 시도 */
    current: () => attempt.current,
    restore: (saved: CampaignAttempt | null | undefined) => {
      attempt.current = saved ?? null;
    },
  };
}
