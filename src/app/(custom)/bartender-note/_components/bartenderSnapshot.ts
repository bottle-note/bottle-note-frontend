import type { AlcoholLookupItem } from '@/api/alcohol/types';
import type {
  ScenarioAnswer,
  ScenarioRequest,
} from '@/api/scenario/scenario.api';
import type { Answers, ReviewDraft, Step } from './types';
import type { Situation } from '../_data/demo';

export const SCENARIO_CAMPAIGN = 'bartender-note-type-d' as const;
export type ScenarioSnapshot = {
  owner: string;
  scenarioId: number;
  versionId?: number;
  answers: ScenarioAnswer[];
  mode: ScenarioRequest['mode'];
  viewQuestionId?: number;
  scrollTop: number;
  pageCount?: number;
  questionTitles: Record<number, string>;
  started: boolean;
  finished: boolean;
  resultShown: boolean;
};

const scenarioKey = (owner: string, scenarioId: number) =>
  `bartender-note:${SCENARIO_CAMPAIGN}:${scenarioId}:${owner}`;
const LOGIN_HANDOFF = 'bartender-note:scenario-login';

export function readScenario(
  owner: string,
  scenarioId: number,
): ScenarioSnapshot | null {
  try {
    let raw = localStorage.getItem(scenarioKey(owner, scenarioId));
    if (owner !== 'guest') {
      const handoff = sessionStorage.getItem(LOGIN_HANDOFF);
      if (handoff) {
        sessionStorage.removeItem(LOGIN_HANDOFF);
        const transfer = JSON.parse(handoff);
        if (
          Date.now() - transfer.savedAt < 30 * 60 * 1000 &&
          transfer.snapshot.owner === 'guest' &&
          transfer.snapshot.scenarioId === scenarioId
        )
          raw = JSON.stringify({
            ...transfer.snapshot,
            owner,
            resultShown: false,
          });
      }
    }
    if (!raw) return null;
    const value: ScenarioSnapshot = JSON.parse(raw);
    if (
      value.owner !== owner ||
      value.scenarioId !== scenarioId ||
      !Number.isSafeInteger(value.versionId) ||
      (value.versionId ?? 0) < 1 ||
      !Array.isArray(value.answers) ||
      value.answers.length > 100 ||
      !value.answers.every(
        (a) =>
          Number.isSafeInteger(a.questionId) &&
          a.questionId > 0 &&
          typeof a.optionId === 'string' &&
          a.optionId.length > 0 &&
          a.optionId.length <= 2048,
      ) ||
      !['QUESTION', 'RESULT'].includes(value.mode) ||
      (value.viewQuestionId !== undefined &&
        (!Number.isSafeInteger(value.viewQuestionId) ||
          value.viewQuestionId < 1))
    )
      return null;
    return {
      ...value,
      pageCount:
        Number.isSafeInteger(value.pageCount) &&
        (value.pageCount ?? 0) > 0 &&
        (value.pageCount ?? 0) <= 100
          ? value.pageCount
          : 1,
      scrollTop: Number.isFinite(value.scrollTop)
        ? Math.max(0, value.scrollTop)
        : 0,
      questionTitles:
        value.questionTitles &&
        typeof value.questionTitles === 'object' &&
        !Array.isArray(value.questionTitles) &&
        Object.values(value.questionTitles).every(
          (title) => typeof title === 'string' && title.length <= 200,
        )
          ? value.questionTitles
          : {},
      started: value.started === true,
      finished: value.finished === true,
      resultShown: value.resultShown === true,
    };
  } catch {
    return null;
  }
}

export function saveScenario(snapshot: ScenarioSnapshot) {
  if (!snapshot.versionId) return;
  try {
    localStorage.setItem(
      scenarioKey(snapshot.owner, snapshot.scenarioId),
      JSON.stringify(snapshot),
    );
  } catch {
    /* 저장소를 사용할 수 없어도 화면은 계속 동작한다. */
  }
}

export function handoffScenarioLogin(snapshot: ScenarioSnapshot) {
  try {
    sessionStorage.setItem(
      LOGIN_HANDOFF,
      JSON.stringify({ savedAt: Date.now(), snapshot }),
    );
  } catch {
    /* 저장할 수 없으면 로그인 후 다시 시작한다. */
  }
}

const STORAGE_KEY = 'bartender-note:snapshot';
/** 다른 페이지에 다녀온 뒤 이어 보기를 허용하는 시간. 지나면 처음 화면부터 시작한다. */
const RESUME_WITHIN_MS = 30 * 60 * 1000;

/** 바텐더 노트 밖으로 나갈 때 남겨 두는 화면 상태. 사진 파일은 저장할 수 없어 비워 둔다. */
export type BartenderSnapshot = {
  journey: { step: Step; history: Step[] };
  answers: Answers;
  likedLookups: AlcoholLookupItem[];
  review: ReviewDraft;
  lastReviewMode: ReviewDraft['mode'];
  chosenId: number | null;
  situation: Situation;
  curationId: number | null;
  postedReviewId: number | null;
};

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
    if (Date.now() - savedAt > RESUME_WITHIN_MS) return null;
    return snapshot;
  } catch {
    return null;
  }
}
