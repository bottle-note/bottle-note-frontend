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

// 게스트에게 콘텐츠 일부만 보여주고 로그인을 요구하는 게이트의 위치
export type LoginGatePage =
  | 'alcohol_detail'
  | 'explore_whiskey'
  | 'explore_review'
  | 'curation_list'
  | 'curation_detail'
  | 'import_clearance_list'
  | 'import_clearance_detail'
  | 'importer_list'
  | 'importer_detail'
  | 'home_recent';

// 다른 화면과 구분해야 하는 진입 위치. 값이 없으면 기존 화면(술 상세, 리뷰 작성 페이지)이다.
export type FeatureSource = 'bartender_note' | 'home';

// 홈 바로가기
export type HomeQuickLink =
  | 'bartender_note'
  | 'taste_test'
  | 'tarot'
  | 'my_records';

// 홈 섹션. weekly_top·recent_viewed는 책갈피 탭, category·region은 둘러보기 탭이다.
export type HomeSection =
  | 'weekly_top'
  | 'recent_viewed'
  | 'curation'
  | 'review'
  | 'category'
  | 'region';

// GA4 이벤트별 파라미터 타입 정의
export interface GA4EventMap {
  // 🔴 1순위 — 핵심 전환
  login: {
    method: LoginMethod;
    trigger?: LoginTrigger;
    gate_page?: LoginGatePage;
  };
  sign_up: {
    method: LoginMethod;
    trigger?: LoginTrigger;
  };
  rate_alcohol: {
    alcohol_id: string;
    alcohol_name: string;
  };
  write_review_start: {
    alcohol_id: string;
    source?: FeatureSource;
  };
  write_review_complete: {
    alcohol_id: string;
    source?: FeatureSource;
  };
  write_review_failed: {
    alcohol_id: string;
    failure_type: 'image_upload' | 'rating_save' | 'review_save';
    source?: FeatureSource;
  };
  add_to_picks: {
    alcohol_id: string;
    alcohol_name: string;
    action: 'add' | 'remove';
    source?: FeatureSource;
  };

  // 🟡 2순위 — 탐색 행동
  search: {
    result_count: number;
    query_length: number;
  };
  search_result_click: {
    alcohol_id: string;
    result_position: number;
  };
  search_no_results: {
    query_length: number;
  };
  view_alcohol_detail: {
    alcohol_id: string;
    alcohol_name: string;
  };
  view_import_clearance_list: {
    access_state: 'guest' | 'member';
    result_state: 'results' | 'empty';
  };
  select_import_clearance: {
    declaration_id: string;
    source: 'list' | 'related';
  };
  view_import_clearance_detail: {
    declaration_id: string;
    access_state: 'guest' | 'member';
    match_status: 'matched' | 'unmatched';
  };
  select_import_clearance_alcohol: {
    declaration_id: string;
    alcohol_id: string;
    source: 'summary' | 'sticky_cta';
  };
  login_prompt_shown: {
    trigger: LoginTrigger;
  };
  login_prompt_converted: {
    trigger: LoginTrigger;
  };
  // 게스트 로그인 게이트: 화면 진입 → 게이트 도달 → 로그인 CTA 클릭
  login_gate_page_view: {
    gate_page: LoginGatePage;
  };
  login_gate_reach: {
    gate_page: LoginGatePage;
    // false면 스크롤 없이 첫 화면에서 게이트가 보였다.
    scrolled_to_reach: boolean;
    seconds_since_view: number;
  };
  login_gate_click: {
    gate_page: LoginGatePage;
    seconds_since_view: number;
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

  // 바텐더 노트
  bartender_start: {
    entry: 'recommend' | 'situation' | 'review' | 'picks';
  };
  bartender_recommend_result: {
    mode: 'taste' | 'situation';
    result_state: 'exact' | 'similar' | 'available' | 'empty';
  };
  bartender_select_alcohol: {
    alcohol_id: string;
    source: 'taste' | 'situation' | 'picks';
  };
  bartender_open_alcohol_page: {
    alcohol_id: string;
    source: 'detail' | 'picks';
  };
  bartender_show_other_candidates: Record<string, never>;
  bartender_story_start: {
    alcohol_id: string;
    trigger: 'offer' | 'replay';
  };
  bartender_story_complete: {
    alcohol_id: string;
  };
  bartender_story_skip: {
    alcohol_id: string;
    stage: 'offer' | 'telling';
  };
  bartender_story_full_text: {
    alcohol_id: string;
  };

  // 홈
  home_quick_link_click: {
    link: HomeQuickLink;
  };
  home_item_click: {
    section: HomeSection;
    item_id: string;
    position: number;
  };
  home_more_click: {
    section: HomeSection;
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
