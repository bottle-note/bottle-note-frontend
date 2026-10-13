'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import BarScene, { type Pose } from './BarScene';
import { ActionDockContext } from './FlowControls';
import type { Step } from './types';

type Props = {
  step: Step;
  title: string;
  subtitle: string;
  progress: number;
  lines: string[];
  pose: Pose;
  onBack?: () => void;
  backLabel?: string;
  onClose: () => void;
  children: ReactNode;
};

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

export default function BartenderFrame({
  step,
  title,
  subtitle,
  progress,
  lines,
  pose,
  onBack,
  backLabel,
  onClose,
  children,
}: Props) {
  const contentRef = useRef<HTMLElement>(null);
  const [actionDock, setActionDock] = useState<HTMLDivElement | null>(null);
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
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const text = pages[page] ?? '';
  const dialogueKey = lines.join('\u0000');
  const currentDialogueKey = `${step}\u0000${dialogueKey}`;
  const introSkipped = skippedIntroKey === currentDialogueKey;
  const introReady = introPhase === 'ready';
  const isTyping = introReady && typed < text.length;
  const optionsVisible =
    introReady && typed >= text.length && page === pages.length - 1;

  useLayoutEffect(() => setSkippedIntroKey(null), [step, dialogueKey]);

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
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => setSceneReady(true), 2500);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    setPage(0);
    setTyped(0);
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [step, dialogueKey]);

  useEffect(() => {
    if (step !== 'intro' || reducedMotion || introSkipped) {
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
  }, [step, dialogueKey, introSkipped, reducedMotion, sceneReady]);

  useEffect(() => {
    if (!introReady || typed >= text.length) return undefined;
    if (reducedMotion) {
      setTyped(text.length);
      return undefined;
    }
    const timer = window.setTimeout(() => setTyped((value) => value + 1), 30);
    return () => window.clearTimeout(timer);
  }, [introReady, reducedMotion, typed, text]);

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

  const advanceDialogue = () => {
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

  return (
    <div
      className="dark flex h-dvh min-h-0 justify-center overflow-hidden bg-bg-layer-basement text-fg-neutral"
      onClickCapture={(event) => {
        if (optionsVisible) return;
        event.preventDefault();
        event.stopPropagation();
        advanceDialogue();
      }}
    >
      <div className="flex h-full min-h-0 w-full max-w-[468px] flex-col bg-bg-layer-default">
        <header className="relative flex h-56 shrink-0 items-center gap-4 px-8">
          <span aria-hidden="true" className="h-40 w-40 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col items-center text-center leading-tight">
            <b className="text-15 font-bold">{title}</b>
            {subtitle && (
              <small className="max-w-full truncate text-11 text-fg-neutral-muted">
                {subtitle}
              </small>
            )}
          </div>
          <button
            type="button"
            className="grid h-40 w-40 shrink-0 place-items-center text-28 leading-none text-fg-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
          <div
            aria-label="진행률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            role="progressbar"
            className="absolute inset-x-0 bottom-0 h-3 overflow-hidden bg-stroke-neutral-subtle"
          >
            <span
              className="block h-full w-full origin-left bg-bg-brand-solid transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </header>
        <div
          className={`relative shrink-0 overflow-hidden bg-bg-layer-basement ${onBack ? 'max-h-[min(40dvh,calc(100dvh-276px))]' : 'max-h-[40dvh]'}`}
        >
          <BarScene
            pose={step === 'intro' && introPhase === 'bow' ? 'bow' : pose}
            talking={isTyping}
            onReady={() => setSceneReady(true)}
          />
          <button
            type="button"
            ref={dialogueRef}
            className={`absolute inset-x-10 bottom-6 z-10 min-h-56 rounded-md bg-[rgba(20,16,13,0.94)] px-14 py-9 text-left text-14 leading-19 text-[#F5EFE5] shadow-md transition-[opacity,transform] duration-250 motion-reduce:transition-none ${introReady ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'}`}
            aria-label="노트의 대사, 누르면 이어 보기"
          >
            <span className="absolute -top-10 left-10 rounded-sm bg-bg-brand-solid px-8 py-2 text-11 font-extrabold leading-14 text-fg-brand-contrast">
              노트
            </span>
            <span className="block min-h-38 whitespace-pre-wrap break-keep">
              {text.slice(0, typed)}
            </span>
            <span
              ref={rulerRef}
              aria-hidden="true"
              className="invisible absolute left-14 right-14 top-0 block whitespace-pre-wrap break-keep"
            />
            {introReady && typed >= text.length && page < pages.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-10 text-8 text-fg-brand motion-safe:animate-pulse"
              >
                ▼
              </span>
            )}
          </button>
        </div>
        <ActionDockContext.Provider value={actionDock}>
          <section
            ref={contentRef}
            className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto overscroll-contain px-20 pb-20 pt-14 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 [&>*]:shrink-0"
          >
            {optionsVisible ? children : null}
          </section>
        </ActionDockContext.Provider>
        <div
          ref={setActionDock}
          role="group"
          aria-label="현재 단계 행동"
          className="empty:hidden z-20 flex shrink-0 flex-col gap-12 px-20 pb-[max(28px,var(--safe-area-bottom))] pt-12 [@media(max-height:500px)]:gap-4 [@media(max-height:500px)]:pt-6"
        >
          {onBack && backLabel && (
            <Button size="md" variant="text" fullWidth onClick={onBack}>
              <ArrowLeft aria-hidden="true" className="h-16 w-16" />
              {backLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
