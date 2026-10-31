'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ArrowLeft } from 'lucide-react';
import SafeAreaScreen from '@/components/ui/Layout/SafeAreaScreen';
import BarScene, { type Pose } from './BarScene';
import { useDialoguePlayback } from './useDialoguePlayback';
import { ActionDockContext } from './FlowControls';
import type { Step } from './types';

const DialogueSettledContext = createContext(true);

/** 바텐더가 지금 대사를 끝까지 말했는지. 대답은 말이 끝난 뒤에 내놓는다. */
export const useDialogueSettled = () => useContext(DialogueSettledContext);

type Props = {
  step: Step;
  title: string;
  subtitle: string;
  progress?: number;
  questionId?: number;
  lines: string[];
  pose: Pose;
  onBack?: () => void;
  backLabel?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function BartenderFrame({
  step,
  title,
  subtitle,
  progress,
  questionId,
  lines,
  pose,
  onBack,
  backLabel,
  onClose,
  children,
}: Props) {
  const contentRef = useRef<HTMLElement>(null);
  const [actionDock, setActionDock] = useState<HTMLDivElement | null>(null);
  const dialogue = useDialoguePlayback(step, lines, questionId);
  const dialogueKey = lines.join('\u0000');

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [step, dialogueKey, questionId]);

  return (
    <div
      className="dark flex h-dvh min-h-0 justify-center overflow-hidden bg-bg-layer-basement text-fg-neutral"
      onClickCapture={(event) => {
        if (
          dialogue.optionsVisible ||
          (event.target as HTMLElement).closest(
            '[data-dialogue-control], [data-flow-action-dock], section',
          )
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        dialogue.advance();
      }}
    >
      <SafeAreaScreen
        insetBottom={false}
        className="w-full max-w-[468px] bg-bg-layer-default"
      >
        <header className="relative flex h-56 shrink-0 items-center gap-4 px-8">
          {onBack ? (
            <button
              type="button"
              className="grid h-40 w-40 shrink-0 place-items-center text-fg-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
              aria-label={backLabel ?? '이전 단계'}
              data-dialogue-control
              onClick={onBack}
            >
              <ArrowLeft aria-hidden="true" className="h-20 w-20" />
            </button>
          ) : (
            <span aria-hidden="true" className="h-40 w-40 shrink-0" />
          )}
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
            data-dialogue-control
            onClick={onClose}
          >
            ×
          </button>
          {progress !== undefined && (
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
          )}
        </header>
        <div className="relative max-h-[40dvh] shrink-0 overflow-hidden bg-bg-layer-basement">
          <BarScene
            pose={
              step === 'intro' && dialogue.introPhase === 'bow' ? 'bow' : pose
            }
            talking={dialogue.isTyping}
            onReady={dialogue.markSceneReady}
          />
          <button
            type="button"
            ref={dialogue.dialogueRef}
            className={`absolute inset-x-10 bottom-6 z-10 min-h-56 rounded-md bg-[rgba(20,16,13,0.94)] px-14 py-9 text-left text-14 leading-19 text-[#F5EFE5] shadow-md transition-[opacity,transform] duration-250 motion-reduce:transition-none ${dialogue.introReady ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'}`}
            aria-label="노트의 대사, 누르면 이어 보기"
          >
            <span className="absolute -top-10 left-10 rounded-sm bg-bg-brand-solid px-8 py-2 text-11 font-extrabold leading-14 text-fg-brand-contrast">
              노트
            </span>
            <span className="block min-h-38 whitespace-pre-wrap break-keep">
              {dialogue.text}
            </span>
            <span
              ref={dialogue.rulerRef}
              aria-hidden="true"
              className="invisible absolute left-14 right-14 top-0 block whitespace-pre-wrap break-keep"
            />
            {dialogue.hasNextPage && (
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-10 text-8 text-fg-brand motion-safe:animate-pulse"
              >
                ▼
              </span>
            )}
          </button>
        </div>
        <DialogueSettledContext.Provider value={dialogue.optionsVisible}>
          <ActionDockContext.Provider value={actionDock}>
            <section
              ref={contentRef}
              className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto overscroll-contain px-20 pb-20 pt-14 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 [&>*]:shrink-0"
            >
              {children}
            </section>
          </ActionDockContext.Provider>
        </DialogueSettledContext.Provider>
        <div
          ref={setActionDock}
          role="group"
          aria-label="현재 단계 행동"
          data-flow-action-dock
          className="empty:hidden z-20 flex shrink-0 flex-col gap-12 px-20 pb-[max(28px,var(--safe-area-bottom))] pt-12 [@media(max-height:500px)]:gap-4 [@media(max-height:500px)]:pt-6"
        />
      </SafeAreaScreen>
    </div>
  );
}
