import type {
  ShareContentType,
  ShareChannel,
  SharePlatform,
} from '@/types/share';

// 로그인 유도 시점 (sessionStorage에 저장되어 로그인 완료 시 이벤트에 포함)
export type LoginTrigger =
  | 'rating'
  | 'comment'
  | 'picks'
  | 'mypage'
  | 'review_write';

export type LoginMethod = 'kakao' | 'apple';

// GA4 이벤트별 파라미터 타입 정의
export interface GA4EventMap {
  // 🔴 1순위 — 핵심 전환
  login: {
    method: LoginMethod;
    trigger?: LoginTrigger;
  };
  sign_up: {
    method: LoginMethod;
    trigger?: LoginTrigger;
  };
  rate_alcohol: {
    alcohol_id: string;
    alcohol_name: string;
  };
  write_review_complete: {
    alcohol_id: string;
  };
  add_to_picks: {
    alcohol_id: string;
    alcohol_name: string;
    action: 'add' | 'remove';
  };

  // 🟡 2순위 — 탐색 행동
  search: {
    search_term: string;
    result_count: number;
  };
  view_alcohol_detail: {
    alcohol_id: string;
    alcohol_name: string;
  };
  login_prompt_shown: {
    trigger: LoginTrigger;
  };
  login_prompt_converted: {
    trigger: LoginTrigger;
  };

  // 🟢 3순위 — 소셜/기타
  tarot_start: Record<string, never>;
  tarot_complete: {
    result_alcohol_id: string;
  };
  follow_user: {
    follow_user_id: number;
    action: 'follow' | 'unfollow';
  };
  like_review: {
    review_id: string;
    action: 'like' | 'unlike';
  };

  // 공유
  share: {
    content_type: ShareContentType;
    content_id: string;
    share_channel: ShareChannel;
    platform: SharePlatform;
    share_success: boolean;
  };
}

export type GA4EventName = keyof GA4EventMap;
