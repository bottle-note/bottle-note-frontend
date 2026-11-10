import { useEffect, useState } from 'react';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { Pose } from './BarScene';
import { getStoryDialogue, type StoryPhase } from './dialogue';
import { loadHeardStories, saveHeardStories } from './heardStories';
import { prefersReducedMotion } from './prefersReducedMotion';
import {
  toDescriptionParagraphs,
  toSentences,
} from '../_scenario/descriptionParagraphs';

/** 첫 문장을 떠올리는 뜸. 이 동안 말풍선 자리에 입력 중 표시를 둔다. */
const SENTENCE_MS = 600;
/** 다음 문장은 앞 문장을 읽을 만큼 기다렸다 잇는다. 기다림이 길다는 의견에 1.5배 빠르게 잇는다. */
const READ_MS_PER_CHAR = 40;
const READ_MS_MIN = 1000;
const READ_MS_MAX = 3000;

const readingMs = (sentence: string) =>
  Math.min(
    READ_MS_MAX,
    Math.max(READ_MS_MIN, sentence.length * READ_MS_PER_CHAR),
  );

const STORY_POSE: Record<StoryPhase, Pose> = {
  offer: 'serve',
  telling: 'serve',
  told: 'smile',
  declined: 'serve',
  settled: 'serve',
};

export type StoryMessage = { from: 'bartender' | 'me'; text: string };

export type StoryState = {
  phase: StoryPhase;
  heard: boolean;
  /** 카드 아래에서 들을지 물었는지. 같은 술에 다시 들어오면 묻지 않는다. */
  asked: boolean;
  /** 「들려주세요」 뒤로 주고받은 말. */
  messages: StoryMessage[];
  /** 들려준 문장 수. */
  told: number;
  /** 다음 문장을 떠올리는 중인지. 이야기하는 동안은 끝까지 이어진다. */
  pending: boolean;
};

const initialState: StoryState = {
  phase: 'offer',
  heard: false,
  asked: true,
  messages: [],
  told: 0,
  pending: false,
};

/** 끝까지 들은 이야기를 다시 왔을 때의 모습. 처음 들었던 대화를 기다림 없이 다 펼쳐 둔다. */
const heardState = (sentences: string[]): StoryState => ({
  phase: 'settled',
  heard: true,
  asked: true,
  messages: [
    { from: 'me', text: '들려주세요' },
    ...sentences.map((text) => ({ from: 'bartender' as const, text })),
  ],
  told: sentences.length,
  pending: false,
});

/** 술 id별 이야기 진행. 페이지를 벗어날 때 스냅샷에 남긴다. */
export type StoryStates = Record<number, StoryState>;

/**
 * 술을 건넨 뒤 바텐더가 그 술 이야기를 들려줄지 묻고, 설명 첫 문단을 문장씩 이어 들려준다.
 * 술마다 진행을 기억해 상세에 다녀와도 같은 술을 다시 묻지 않는다.
 * 술 상세 페이지에 다녀오면(스냅샷 복원) 주고받은 말을 그대로 펼쳐 두고, 듣던 중이었으면 이어서 들려준다.
 */
export function useAlcoholStory({
  alcohol,
  active,
  greeting,
}: {
  alcohol: { id: number; description?: string } | undefined;
  /** 술 이야기 화면을 보고 있는지. */
  active: boolean;
  greeting: string;
}) {
  const [states, setStates] = useState<StoryStates>({});
  // 이야기 화면은 처음 그릴 때 나오지 않아 서버 렌더와 어긋나지 않는다
  const [heardIds, setHeardIds] = useState<number[]>(() =>
    typeof window === 'undefined' ? [] : loadHeardStories(),
  );
  const paragraphs = toDescriptionParagraphs(alcohol?.description);
  const id = alcohol?.id;
  const sentences = paragraphs ? toSentences(paragraphs[0]) : [];
  /** '처음으로'로 진행을 지워도 이 탭에서 끝까지 들은 이야기는 펼쳐 둔다. */
  const heardBefore = id !== undefined && heardIds.includes(id);
  const startState = heardBefore ? heardState(sentences) : initialState;
  const state =
    id !== undefined && paragraphs ? states[id] ?? startState : undefined;

  const update = (next: Partial<StoryState>) => {
    if (id === undefined) return;
    setStates((current) => ({
      ...current,
      [id]: { ...(current[id] ?? startState), ...next },
    }));
  };

  // 다시 들어오면 끝까지 들은 이야기는 다 펼쳐 두고, 아니면 첫 잔 인사로 돌아간다.
  useEffect(() => {
    if (active || id === undefined) return;
    setStates((current) => {
      const previous = current[id];
      if (!previous || previous.phase === 'settled') return current;
      return {
        ...current,
        [id]: previous.heard
          ? heardState(sentences)
          : {
              ...previous,
              phase: 'settled',
              asked: false,
              messages: [],
              told: 0,
              pending: false,
            },
      };
    });
    // 떠나는 순간의 술 설명으로 펼칠 대화를 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, id]);

  useEffect(() => {
    if (!active || !state?.pending || id === undefined) return undefined;
    const timer = window.setTimeout(
      () => {
        const told = state.told + 1;
        const last = told >= sentences.length;
        if (last) {
          trackGA4Event('bartender_story_complete', { alcohol_id: String(id) });
          if (!heardIds.includes(id)) {
            const next = [...heardIds, id];
            setHeardIds(next);
            saveHeardStories(next);
          }
        }
        update({
          messages: [
            ...state.messages,
            { from: 'bartender', text: sentences[state.told] },
          ],
          told,
          pending: !last,
          ...(last && { phase: 'told', heard: true }),
        });
      },
      prefersReducedMotion()
        ? 0
        : state.told
          ? readingMs(sentences[state.told - 1])
          : SENTENCE_MS,
    );
    return () => window.clearTimeout(timer);
    // 뜸이 끝나면 다음 문장 하나만 붙이고, 그 문장을 읽을 동안 다시 기다린다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, state?.pending, state?.told, id]);

  const reset = () => setStates({});
  const persisted = { states, restore: setStates };
  if (!state || !paragraphs || id === undefined)
    return { story: null, reset, persisted };
  const alcoholId = String(id);
  const say = (text: string): StoryMessage[] => [
    ...state.messages,
    { from: 'me', text },
  ];

  const story = {
    phase: state.phase,
    heard: state.heard,
    asked: state.asked,
    messages: state.messages,
    pending: state.pending,
    paragraphs,
    pose: state.pending ? ('think' as const) : STORY_POSE[state.phase],
    lines: getStoryDialogue({
      phase: state.phase,
      alcoholId: id,
      greeting,
      paragraphs,
    }),
    listen: () => {
      trackGA4Event('bartender_story_start', {
        alcohol_id: alcoholId,
        trigger: state.heard ? 'replay' : 'offer',
      });
      update({
        phase: 'telling',
        // 다시 들을 때는 처음부터 새로 들려준다
        messages: [
          {
            from: 'me',
            text: state.heard ? '다시 들려주세요' : '들려주세요',
          },
        ],
        told: 0,
        pending: true,
      });
    },
    skip: () => {
      trackGA4Event('bartender_story_skip', {
        alcohol_id: alcoholId,
        stage: state.phase === 'telling' ? 'telling' : 'offer',
      });
      update({
        phase: 'declined',
        messages: say(state.phase === 'telling' ? '그만 들을게요' : '다음에요'),
        pending: false,
      });
    },
    openFullText: () =>
      trackGA4Event('bartender_story_full_text', { alcohol_id: alcoholId }),
  };
  return { story, reset, persisted };
}

export type AlcoholStory = NonNullable<
  ReturnType<typeof useAlcoholStory>['story']
>;
