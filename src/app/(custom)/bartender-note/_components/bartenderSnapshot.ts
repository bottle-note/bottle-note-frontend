import type { AlcoholSelection, ReviewDraft, Step } from './types';
import type { ScenarioAnswer, ScenarioContext } from '../_scenario/model';
import type { Situation } from '../_data/demo';

const STORAGE_KEY = 'bartender-note:snapshot:v3';
/** 다른 페이지에 다녀온 뒤 이어 보기를 허용하는 시간. 지나면 처음 화면부터 시작한다. */
const RESUME_WITHIN_MS = 30 * 60 * 1000;

/** 바텐더 노트 밖으로 나갈 때 남겨 두는 화면 상태. 사진 파일은 저장할 수 없어 비워 둔다. */
export interface BartenderSnapshot {
  journey: { step: Step; history: Step[] };
  scenario: {
    context: ScenarioContext;
    answers: ScenarioAnswer[];
    versionId: number | null;
  };
  review: ReviewDraft;
  lastReviewMode: ReviewDraft['mode'];
  selection: AlcoholSelection | null;
  situation: Situation;
  curationId: number | null;
  postedReviewId: number | null;
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
