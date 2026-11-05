import type { ReviewDraft, Step } from './types';
import type { JourneyState } from './useBartenderJourney';
import type { StoryStates } from './useAlcoholStory';
import type {
  CampaignAttempt,
  ReviewCampaignAttempt,
} from './useBartenderCampaign';
import type { ScenarioAnswer, ScenarioContext } from '../_scenario/model';

// v5: 상황 단계(situation·curation-empty)를 없애고 큐레이션 API로 바꿨다
const STORAGE_KEY = 'bartender-note:snapshot:v5';
/** 다른 페이지에 다녀온 뒤 이어 보기를 허용하는 시간. 지나면 처음 화면부터 시작한다. */
const RESUME_WITHIN_MS = 30 * 60 * 1000;

/** 바텐더 노트 밖으로 나갈 때 남겨 두는 화면 상태. 사진 파일은 저장할 수 없어 비워 둔다. */
export interface BartenderSnapshot {
  journey: JourneyState;
  scenario: {
    context: ScenarioContext;
    answers: ScenarioAnswer[];
    /** 되돌아간 질문에서 기억해 둔 답까지 포함한 답의 길 */
    trail: ScenarioAnswer[];
    versionId: number | null;
  };
  review: ReviewDraft;
  lastReviewMode: ReviewDraft['mode'];
  curationId: number | null;
  postedReviewId: number | null;
  /** 술 이야기 진행. 술 상세에 다녀와도 들은 이야기를 펼친 채로 돌려준다. */
  stories?: StoryStates;
  /** 로그인하러 나갈 때 이어서 열 단계. 로그인한 채로 돌아온 경우에만 연다. */
  resumeAfterLogin?: Step;
  /**
   * 로그인하러 나간 바텐더 노트 주소. 로그인 화면은 주소를 바꿔 끼우며 돌아와 히스토리 표시가 남지 않으므로,
   * 같은 주소로 돌아왔을 때만 로그인 왕복으로 보고 보던 화면을 잇는다.
   * 로그인을 그만두고 다른 화면에서 새로 넘어오면(주류 상세의 비슷한 위스키 링크 등) 주소가 달라 새로 시작한다.
   */
  loginReturnTo?: string;
  /** 진행 중인 캠페인 시도. 돌아와서 같은 완료·결과를 다시 보내지 않게 남긴다. */
  campaign?: CampaignAttempt | null;
  /** 원래 캠페인과 독립된 리뷰 시도·유입 경로. 로그인 왕복·새로고침에도 유지한다. */
  reviewCampaign?: ReviewCampaignAttempt | null;
}

export function saveSnapshot(snapshot: BartenderSnapshot) {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), snapshot }),
    );
  } catch {
    // 저장소를 쓸 수 없으면 돌아왔을 때 처음 화면부터 시작한다.
  }
}

/** 남겨 둔 화면 상태를 한 번만 꺼낸다. 꺼낸 상태는 지운다. */
export function takeSnapshot(): BartenderSnapshot | null {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (!saved) return null;
    const { savedAt, snapshot } = JSON.parse(saved) as {
      savedAt: number;
      snapshot: BartenderSnapshot;
    };
    return Date.now() - savedAt <= RESUME_WITHIN_MS ? snapshot : null;
  } catch {
    return null;
  }
}
