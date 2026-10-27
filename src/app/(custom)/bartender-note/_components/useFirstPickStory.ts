import { useEffect, useState } from 'react';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { Pose } from './BarScene';
import { getStoryDialogue, type StoryPhase } from './dialogue';
import { prefersReducedMotion } from './prefersReducedMotion';
import { toSentences } from '../_scenario/descriptionParagraphs';
import type { ScenarioCandidate } from '../_scenario/model';

/** 다음 문장을 떠올리는 뜸. 이 동안 말풍선 자리에 입력 중 표시를 둔다. */
const SENTENCE_MS = 900;

const STORY_POSE: Record<StoryPhase, Pose> = {
  offer: 'serve',
  telling: 'serve',
  told: 'smile',
  declined: 'serve',
  settled: 'serve',
};

export type StoryMessage = { from: 'bartender' | 'me'; text: string };

type StoryState = {
  phase: StoryPhase;
  heard: boolean;
  /** 카드 아래에서 들을지 물었는지. 다시 들어오면 묻지 않는다. */
  asked: boolean;
  /** 「들려주세요」 뒤로 주고받은 말. */
  messages: StoryMessage[];
  /** 들려준 문장 수. */
  told: number;
  /** 다음 문장을 떠올리는 중인지. */
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

/**
 * 첫 잔을 건넨 뒤 바텐더가 그 술 이야기를 들려줄지 묻고, 첫 문단을 문장씩 들려준다.
 * 술마다 진행을 기억해 상세에 다녀와도 같은 술을 다시 묻지 않는다.
 * 페이지를 벗어났다 돌아오면(스냅샷 복원) 다시 묻는다.
 */
export function useFirstPickStory({
  candidate,
  active,
  greeting,
}: {
  candidate: ScenarioCandidate | undefined;
  /** 첫 잔 단계를 보고 있는지. */
  active: boolean;
  greeting: string;
}) {
  const [states, setStates] = useState<Record<number, StoryState>>({});
  const paragraphs = candidate?.descriptionParagraphs;
  const id = candidate?.id;
  const state =
    id !== undefined && paragraphs ? states[id] ?? initialState : undefined;
  const sentences = paragraphs ? toSentences(paragraphs[0]) : [];

  const update = (next: Partial<StoryState>) => {
    if (id === undefined) return;
    setStates((current) => ({
      ...current,
      [id]: { ...(current[id] ?? initialState), ...next },
    }));
  };

  // 주고받은 말은 방금 들은 자리에만 남긴다. 다시 들어오면 첫 잔 인사로 돌아간다.
  useEffect(() => {
    if (active || id === undefined) return;
    setStates((current) => {
      const previous = current[id];
      if (!previous || previous.phase === 'settled') return current;
      return {
        ...current,
        [id]: {
          ...previous,
          phase: 'settled',
          asked: false,
          messages: [],
          told: 0,
          pending: false,
        },
      };
    });
  }, [active, id]);

  useEffect(() => {
    if (!active || !state?.pending || id === undefined) return undefined;
    const timer = window.setTimeout(
      () => {
        const told = state.told + 1;
        const last = told >= sentences.length;
        if (last)
          trackGA4Event('bartender_story_complete', { alcohol_id: String(id) });
        update({
          messages: [
            ...state.messages,
            { from: 'bartender', text: sentences[state.told] },
          ],
          told,
          pending: false,
          ...(last && { phase: 'told', heard: true }),
        });
      },
      prefersReducedMotion() ? 0 : SENTENCE_MS,
    );
    return () => window.clearTimeout(timer);
    // 뜸이 끝나면 다음 문장 하나만 붙인다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, state?.pending, id]);

  const reset = () => setStates({});
  if (!state || !paragraphs || id === undefined) return { story: null, reset };
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
    /** 다음 문장을 청한다. */
    next: () => update({ messages: say('계속 들려주세요'), pending: true }),
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
  return { story, reset };
}

export type FirstPickStory = NonNullable<
  ReturnType<typeof useFirstPickStory>['story']
>;
