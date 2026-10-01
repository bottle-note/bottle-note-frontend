'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from '../bartender.module.css';

interface Props {
  pages: string[];
  ready: boolean;
  onTalkingChange: (talking: boolean) => void;
}

/** Mount with a step key so navigation cancels all pending text and page timers. */
export default function BartenderDialogue({
  pages,
  ready,
  onTalkingChange,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [length, setLength] = useState(0);
  const characters = Array.from(pages[page] ?? '');
  const complete = reduceMotion || length >= characters.length;

  useEffect(() => {
    if (!ready || reduceMotion || complete) return;
    const timer = window.setInterval(() => setLength((value) => value + 1), 30);
    return () => window.clearInterval(timer);
  }, [ready, reduceMotion, complete, page]);

  useEffect(() => {
    onTalkingChange(ready && !complete);
    return () => onTalkingChange(false);
  }, [ready, complete, onTalkingChange]);

  useEffect(() => {
    if (!ready || !complete || page === pages.length - 1 || reduceMotion)
      return;
    const timer = window.setTimeout(
      () => {
        setPage((value) => value + 1);
        setLength(0);
      },
      Math.max(2400, characters.length * 70),
    );
    return () => window.clearTimeout(timer);
  }, [ready, complete, page, pages.length, characters.length, reduceMotion]);

  const advance = () => {
    if (!complete) setLength(characters.length);
    else if (page < pages.length - 1) {
      setPage(page + 1);
      setLength(0);
    }
  };

  return (
    <button
      type="button"
      className={styles.dialogue}
      onClick={advance}
      disabled={!ready}
      aria-label={`노트: ${pages[page]}${!complete ? ' · 누르면 대사를 바로 보여줘요' : page < pages.length - 1 ? ' · 다음 대사' : ''}`}
    >
      <span className={styles.speaker} aria-hidden="true">
        노트
      </span>
      <span className={styles.dialogueText} aria-hidden="true">
        {ready
          ? characters.slice(0, reduceMotion ? undefined : length).join('')
          : '잠시만 기다려 주세요.'}
      </span>
      <span className={styles.dialogueHint} aria-hidden="true">
        {!complete
          ? '눌러서 바로 보기'
          : page < pages.length - 1
            ? '눌러서 다음 이야기 ›'
            : '편하게 골라 주세요'}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {ready && complete ? pages[page] : ''}
      </span>
    </button>
  );
}
