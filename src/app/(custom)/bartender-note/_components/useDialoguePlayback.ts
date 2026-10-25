import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './prefersReducedMotion';
import type { Step } from './types';

/** 대사창 두 줄(40px)에 들어가도록 대사를 페이지로 나눈다. 긴 낱말은 글자 단위로 자른다. */
function paginateDialogue(value: string, fits: (text: string) => boolean) {
  const pages: string[] = [];
  let current = '';
  const push = () => {
    if (current) pages.push(current);
    current = '';
  };
  value.split('\n').forEach((paragraph, paragraphIndex) => {
    paragraph
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, wordIndex) => {
        const separator = current
          ? paragraphIndex > 0 && wordIndex === 0
            ? '\n'
            : ' '
          : '';
        const candidate = `${current}${separator}${word}`;
        if (fits(candidate)) {
          current = candidate;
          return;
        }
        push();
        if (fits(word)) {
          current = word;
          return;
        }
        [...word].forEach((character) => {
          if (fits(`${current}${character}`)) current += character;
          else {
            push();
            current = character;
          }
        });
      });
  });
  push();
  return pages.length ? pages : [''];
}

/**
 * 대사창의 진행. 첫 화면에서는 인사 동작 뒤에 말을 시작하고,
 * 한 글자씩 타이핑한 뒤 다음 페이지로 넘어간다. 누르면 타이핑을 끝내거나 다음 페이지로 간다.
 */
export function useDialoguePlayback(
  step: Step,
  lines: string[],
  questionId?: number,
) {
  const dialogueRef = useRef<HTMLButtonElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);
  const [dialogueWidth, setDialogueWidth] = useState(0);
  const [pages, setPages] = useState(lines);
  const [page, setPage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [skippedIntroKey, setSkippedIntroKey] = useState<string | null>(null);
  const [introPhase, setIntroPhase] = useState<'bow' | 'greet' | 'ready'>(
    step === 'intro' ? 'bow' : 'ready',
  );
  const [sceneReady, setSceneReady] = useState(false);
  const text = pages[page] ?? '';
  const dialogueKey = lines.join('\u0000');
  const currentDialogueKey = `${step}\u0000${questionId ?? ''}\u0000${dialogueKey}`;
  const introSkipped = skippedIntroKey === currentDialogueKey;
  const introReady = introPhase === 'ready';
  const isTyping = introReady && typed < text.length;
  const optionsVisible =
    introReady && typed >= text.length && page === pages.length - 1;

  useLayoutEffect(
    () => setSkippedIntroKey(null),
    [step, dialogueKey, questionId],
  );

  useEffect(() => {
    const element = dialogueRef.current;
    if (!element) return undefined;
    const update = () => setDialogueWidth(element.clientWidth);
    update();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler || !dialogueWidth) return;
    const fits = (value: string) => {
      ruler.textContent = value;
      return ruler.getBoundingClientRect().height <= 40;
    };
    setPages(
      dialogueKey
        .split('\u0000')
        .flatMap((line) => paginateDialogue(line, fits)),
    );
    setPage(0);
    setTyped(0);
  }, [dialogueKey, dialogueWidth]);

  useEffect(() => {
    const fallback = window.setTimeout(() => setSceneReady(true), 2500);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    setPage(0);
    setTyped(0);
  }, [step, dialogueKey, questionId]);

  useEffect(() => {
    if (step !== 'intro' || prefersReducedMotion() || introSkipped) {
      setIntroPhase('ready');
      return undefined;
    }
    setIntroPhase('bow');
    if (!sceneReady) return undefined;
    const greetTimer = window.setTimeout(() => setIntroPhase('greet'), 1100);
    const talkTimer = window.setTimeout(() => setIntroPhase('ready'), 1900);
    return () => {
      window.clearTimeout(greetTimer);
      window.clearTimeout(talkTimer);
    };
  }, [step, dialogueKey, introSkipped, sceneReady]);

  useEffect(() => {
    if (!introReady || typed >= text.length) return undefined;
    if (prefersReducedMotion()) {
      setTyped(text.length);
      return undefined;
    }
    const timer = window.setTimeout(() => setTyped((value) => value + 1), 30);
    return () => window.clearTimeout(timer);
  }, [introReady, typed, text]);

  useEffect(() => {
    if (!introReady || typed < text.length || page >= pages.length - 1)
      return undefined;
    const readingMs = Math.min(
      2500,
      Math.max(1200, 500 + 50 * text.replace(/\s/g, '').length),
    );
    const timer = window.setTimeout(() => {
      setPage((value) => value + 1);
      setTyped(0);
    }, readingMs);
    return () => window.clearTimeout(timer);
  }, [introReady, typed, text, page, pages.length]);

  const advance = () => {
    if (!introReady) {
      setSkippedIntroKey(currentDialogueKey);
      setIntroPhase('ready');
    }
    if (typed < text.length) {
      setTyped(text.length);
    } else if (page < pages.length - 1) {
      setPage(page + 1);
      setTyped(0);
    }
  };

  return {
    dialogueRef,
    rulerRef,
    text: text.slice(0, typed),
    introPhase,
    introReady,
    isTyping,
    hasNextPage: introReady && typed >= text.length && page < pages.length - 1,
    optionsVisible,
    advance,
    markSceneReady: () => setSceneReady(true),
  };
}
