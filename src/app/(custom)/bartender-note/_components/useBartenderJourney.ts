import { useState } from 'react';
import type { Step } from './types';

/** 지금 보고 있는 단계와 지나온 단계. 뒤로 가기는 지나온 단계를 하나씩 되짚는다. */
export function useBartenderJourney() {
  const [step, setStep] = useState<Step>('intro');
  const [history, setHistory] = useState<Step[]>([]);

  const move = (next: Step) => {
    setHistory((current) => [...current, step]);
    setStep(next);
  };
  const back = () => {
    if (history.length === 0) return;
    setStep(history[history.length - 1]);
    setHistory((current) => current.slice(0, -1));
  };
  /** 지나온 단계를 지우고 새로 시작한다. 이때는 뒤로 갈 단계가 없다. */
  const restart = (next: Step = 'intro') => {
    setHistory([]);
    setStep(next);
  };

  const restore = (saved: { step: Step; history: Step[] }) => {
    setStep(saved.step);
    setHistory(saved.history);
  };

  return {
    step,
    history,
    previous: history[history.length - 1] as Step | undefined,
    move,
    back,
    restart,
    restore,
  };
}
