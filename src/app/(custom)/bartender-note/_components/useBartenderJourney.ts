import { useEffect, useRef, useState } from 'react';
import type { AlcoholSelection, Step } from './types';

/** 지나온 길의 한 지점. 답한 질문 수와 고른 술도 함께 묶어 되돌아올 때 같이 돌린다. */
export interface JourneyPosition {
  step: Step;
  answers: number;
  selection: AlcoholSelection | null;
}

export interface JourneyState {
  stack: JourneyPosition[];
  index: number;
}

type PositionPatch = Partial<Omit<JourneyPosition, 'step'>>;

const KEY = 'bartenderNote';
const START: JourneyPosition = { step: 'intro', answers: 0, selection: null };

const indexOf = (state: unknown): number | undefined => {
  const index = (state as { [KEY]?: { index?: unknown } } | null)?.[KEY]?.index;
  return typeof index === 'number' ? index : undefined;
};
const push = (index: number) =>
  window.history.pushState({ [KEY]: { index } }, '');

/**
 * 지금 보고 있는 단계와 지나온 단계.
 * 단계마다 브라우저 히스토리 항목을 쌓아, 화면의 뒤로 가기와 기기 뒤로 가기가 같은 길을 되짚는다.
 * 화면 상태는 메모리에 두고, 히스토리 항목에는 몇 번째 지점인지만 적는다.
 */
export function useBartenderJourney(
  /** 브라우저 이동으로 다른 지점에 도착했을 때 */
  onTraverse: (to: JourneyPosition) => void,
) {
  const [journey, setJourney] = useState<JourneyState>({
    stack: [START],
    index: 0,
  });
  const current = useRef(journey);
  current.current = journey;
  const traverse = useRef(onTraverse);
  traverse.current = onTraverse;
  /** 첫 지점으로 되감은 뒤 다시 쌓을 항목 수 */
  const rewinding = useRef<number | null>(null);

  const apply = (next: JourneyState) => {
    current.current = next;
    setJourney(next);
  };

  /** 첫 항목으로 되감고, 도착하면 count개 항목을 다시 쌓는다. */
  const rewind = (from: number, count: number) => {
    if (from === 0) {
      for (let index = 1; index <= count; index += 1) push(index);
      return;
    }
    rewinding.current = count;
    window.history.go(-from);
  };

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const target = indexOf(event.state);
      if (target === undefined) return;
      if (rewinding.current !== null) {
        const count = rewinding.current;
        rewinding.current = null;
        rewind(0, count);
        return;
      }
      const { stack } = current.current;
      if (target >= stack.length) return;
      apply({ stack, index: target });
      traverse.current(stack[target]);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  /** 다음 단계로 간다. 고른 술·답한 질문 수는 바꾸지 않으면 지금 지점을 이어받는다. */
  const move = (step: Step, patch?: PositionPatch) => {
    const { stack, index } = current.current;
    apply({
      stack: [
        ...stack.slice(0, index + 1),
        { ...stack[index], ...patch, step },
      ],
      index: index + 1,
    });
    push(index + 1);
  };

  /** 지금 지점을 바꾼다. 되돌아와 다시 볼 필요가 없는 단계를 건너뛸 때 쓴다. */
  const replace = (step: Step, patch?: PositionPatch) => {
    const { stack, index } = current.current;
    apply({
      stack: [...stack.slice(0, index), { ...stack[index], ...patch, step }],
      index,
    });
  };

  /** 한 지점 되짚는다. 화면은 브라우저의 이동 알림을 받아 바꾼다. */
  const back = () => {
    if (current.current.index > 0) window.history.back();
  };

  /** 지나온 길을 비운다. 처음 화면이 아닌 단계로 시작하면 그 뒤로 가기는 처음 화면이다. */
  const restart = (step: Step = 'intro', patch?: PositionPatch) => {
    const stack =
      step === 'intro' ? [START] : [START, { ...START, ...patch, step }];
    const from = current.current.index;
    apply({ stack, index: stack.length - 1 });
    rewind(from, stack.length - 1);
  };

  /**
   * 처음 열릴 때 지나온 길을 맞춘다.
   * 새로고침·뒤로 가기로 돌아오면 브라우저가 기억한 항목에서, 링크로 새로 들어오면 남겨 둔 길을 다시 쌓아 이어 간다.
   */
  const init = (saved?: JourneyState) => {
    const entry = indexOf(window.history.state);
    if (entry !== undefined) {
      if (saved && entry < saved.stack.length) {
        apply({ stack: saved.stack, index: entry });
      } else {
        apply({ stack: [START], index: 0 });
        rewind(entry, 0);
      }
      return;
    }
    window.history.replaceState({ [KEY]: { index: 0 } }, '');
    if (!saved) return;
    apply({ stack: saved.stack.slice(0, saved.index + 1), index: saved.index });
    rewind(0, saved.index);
  };

  const position = journey.stack[journey.index];
  return {
    journey,
    position,
    step: position.step,
    previous: journey.stack[journey.index - 1] as JourneyPosition | undefined,
    move,
    replace,
    back,
    restart,
    init,
  };
}
