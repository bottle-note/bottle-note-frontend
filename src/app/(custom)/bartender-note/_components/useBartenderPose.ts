import { useEffect, useRef, useState } from 'react';
import type { Pose } from './BarScene';
import { getStepPose } from './stepMeta';
import { prefersReducedMotion } from './prefersReducedMotion';
import type { Step } from './types';

/** 단계에 들어설 때 잠깐 하는 동작과, 동작이 끝난 뒤 이어지는 자세. */
const ENTRY_GESTURES: Partial<
  Record<Step, { gesture: Pose; then: Pose; ms: number }>
> = {
  detail: { gesture: 'pour', then: 'serve', ms: 1700 },
  'review-done': { gesture: 'toast', then: 'smile', ms: 3000 },
};

const SMILE_MS = 2600;

/** 바텐더의 자세. 단계별 기본 자세에 잠깐의 동작을 얹는다. */
export function useBartenderPose(step: Step) {
  const [gesture, setGesture] = useState<Pose | null>(null);
  const smileTimer = useRef<number | null>(null);

  useEffect(() => {
    if (smileTimer.current !== null) {
      window.clearTimeout(smileTimer.current);
      smileTimer.current = null;
    }
    const entry = ENTRY_GESTURES[step];
    setGesture(entry?.gesture ?? null);
    if (!entry) return undefined;
    const timer = window.setTimeout(
      () => setGesture(entry.then),
      prefersReducedMotion() ? 0 : entry.ms,
    );
    return () => window.clearTimeout(timer);
  }, [step]);

  /** 잠깐 웃었다가 술을 내미는 자세로 돌아간다. */
  const smile = () => {
    setGesture('smile');
    if (smileTimer.current !== null) window.clearTimeout(smileTimer.current);
    smileTimer.current = window.setTimeout(
      () => setGesture('serve'),
      prefersReducedMotion() ? 0 : SMILE_MS,
    );
  };

  return { pose: gesture ?? getStepPose(step), smile };
}
