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
import { cn } from '@/lib/utils';
import BarScene, { type Pose } from './BarScene';
import { useDialoguePlayback } from './useDialoguePlayback';
import { useSoftKeyboard } from './useSoftKeyboard';
import { ActionDockContext } from './FlowControls';
import type { Step } from './types';

const DialogueSettledContext = createContext(true);

/** 바텐더가 지금 대사를 끝까지 말했는지. 대답은 말이 끝난 뒤에 내놓는다. */
export const useDialogueSettled = () => useContext(DialogueSettledContext);

/** 타이핑 중인 대사에서 강조 낱말 구간만 굵게 그린다. 낱말이 페이지에 없으면 평문이다. */
function emphasizeTyped(typed: string, pageText: string, emphasis?: string) {
  const start = emphasis ? pageText.indexOf(emphasis) : -1;
  if (!emphasis || start < 0 || typed.length <= start) return typed;
  const end = start + emphasis.length;
  return (
    <>
      {typed.slice(0, start)}
      <strong className="font-bold">{typed.slice(start, end)}</strong>
      {typed.slice(end)}
    </>
  );
}

type Props = {
  step: Step;
  title: string;
  subtitle: string;
  progress?: number;
  questionId?: number;
  lines: string[];
  /** 대사에서 굵게 보일 낱말(예: 기준 위스키 이름). */
  emphasis?: string;
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
  emphasis,
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
  const space = useSoftKeyboard(contentRef);
  // 키보드가 떠 있는 동안 장면은 대사 한 줄 띠로 접는다. 장면과 대사창은 지우지 않고 가려서 애니메이션·대사 나눔이 다시 시작되지 않게 한다
  const sceneConcealed = space.tight ? 'invisible' : undefined;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [step, dialogueKey, questionId]);

  return (
    <div
      className="flex h-dvh min-h-0 justify-center overflow-hidden bg-bg-layer-basement text-fg-neutral"
      style={space.tight ? { height: `${space.visibleHeight}px` } : undefined}
      data-space-tight={space.tight || undefined}
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
      {/* 하단 버튼 칸이 비어도 목록 끝의 "처음으로" 같은 링크가 홈 인디케이터에 가리지 않게 틀이 safe area를 둔다 */}
      <SafeAreaScreen
        className={`w-full max-w-content bg-bg-layer-default ${space.tight ? 'h-full pb-0' : ''}`}
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
        <div
          className={`relative shrink-0 overflow-hidden bg-bg-layer-basement ${space.tight ? 'h-40' : 'max-h-[40dvh]'}`}
        >
          {space.tight && (
            <p
              data-dialogue-strip
              className="absolute inset-0 z-20 m-0 flex items-center gap-8 bg-palette-oak-1000 px-14 text-13 text-palette-oak-50"
            >
              <span className="shrink-0 rounded-sm bg-bg-brand-solid px-8 py-2 text-11 font-extrabold leading-14 text-fg-brand-contrast">
                노트
              </span>
              <span className="min-w-0 truncate">
                {dialogue.pageText.replace(/\s*\n\s*/g, ' ')}
              </span>
            </p>
          )}
          <BarScene
            pose={
              step === 'intro' && dialogue.introPhase === 'bow' ? 'bow' : pose
            }
            talking={dialogue.isTyping}
            onReady={dialogue.markSceneReady}
            className={sceneConcealed}
          />
          {/* 대사창은 어두운 바 장면 위에 겹치므로 테마와 무관하게 어두운 색을 유지한다 */}
          <button
            type="button"
            ref={dialogue.dialogueRef}
            className={cn(
              'absolute inset-x-10 bottom-6 z-10 min-h-56 rounded-md bg-palette-oak-1000/[0.94] px-14 py-9 text-left text-14 leading-19 text-palette-oak-50 shadow-md transition-[opacity,transform] duration-250 motion-reduce:transition-none',
              dialogue.introReady
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-8 opacity-0',
              sceneConcealed,
            )}
            aria-label="노트의 대사, 누르면 이어 보기"
          >
            <span className="absolute -top-10 left-10 rounded-sm bg-bg-brand-solid px-8 py-2 text-11 font-extrabold leading-14 text-fg-brand-contrast">
              노트
            </span>
            <span className="block min-h-38 whitespace-pre-wrap break-keep">
              {emphasizeTyped(dialogue.text, dialogue.pageText, emphasis)}
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
          // 입력하는 동안 하단 버튼은 숨기고 키보드를 닫으면 다시 보인다
          className={`empty:hidden z-20 shrink-0 flex-col gap-12 px-20 pb-[var(--bottom-cta-gap)] pt-12 [@media(max-height:500px)]:gap-4 [@media(max-height:500px)]:pt-6 ${space.tight ? 'hidden' : 'flex'}`}
        />
      </SafeAreaScreen>
    </div>
  );
}
