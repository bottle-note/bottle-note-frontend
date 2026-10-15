'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { getTastingHapticType } from '@/constants/tastingNote';
import type { ReviewTastingProfile } from '@/api/review/types';
import {
  createDefaultTastingProfile,
  getTastingAxisHints,
  isTastingProfileEmpty,
} from '@/api/review/tastingProfile';
import { FormValues } from '@/types/Review';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import TastingRadarChart from './TastingRadarChart';
import FlavorAxisControl from './FlavorAxisControl';
import TastingConfirmDialog from './TastingConfirmDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const isSameProfile = (a: ReviewTastingProfile, b: ReviewTastingProfile) =>
  JSON.stringify(a) === JSON.stringify(b);

export default function TastingNoteModal({ isOpen, onClose }: Props) {
  const { setValue, getValues } = useFormContext<FormValues>();

  // 완료 전까지는 폼 값을 바꾸지 않고 초안만 수정한다.
  const [baseline, setBaseline] = useState<ReviewTastingProfile>(
    createDefaultTastingProfile,
  );
  const [draft, setDraft] = useState<ReviewTastingProfile>(
    createDefaultTastingProfile,
  );
  /** 저장돼 있던 기록을 고칠 때만 원래 점수를 함께 보여준다. */
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const isDirty = !isSameProfile(draft, baseline);

  const originalScores = useMemo(
    () =>
      new Map(
        hasSavedProfile
          ? baseline.axes.map((axis) => [axis.name, axis.score])
          : [],
      ),
    [baseline, hasSavedProfile],
  );

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const historyPushedRef = useRef(false);
  /** 완료·버리기로 닫을 때는 뒤로 가기 확인을 건너뛴다. */
  const closingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const saved = getValues('tastingProfile');
    const start = saved ?? createDefaultTastingProfile();
    setBaseline(start);
    setDraft(start);
    setHasSavedProfile(!isTastingProfileEmpty(saved));
    setActiveIndex(null);
    setIsDiscardConfirmOpen(false);
    closingRef.current = false;
  }, [isOpen, getValues]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // 뒤로가기 시 모달 닫기 위한 history entry 추가
      window.history.pushState({ tastingNoteModal: true }, '');
      historyPushedRef.current = true;

      const handlePopState = () => {
        if (!closingRef.current && isDirtyRef.current) {
          // 바뀐 내용이 있으면 닫지 않고 확인을 묻는다.
          window.history.pushState({ tastingNoteModal: true }, '');
          setIsDiscardConfirmOpen(true);
          return;
        }
        historyPushedRef.current = false;
        onCloseRef.current();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.body.style.overflow = '';

        // 모달이 열린 채 컴포넌트가 unmount되면 잔류 history entry 제거
        if (historyPushedRef.current) {
          historyPushedRef.current = false;
          window.history.back();
        }
      };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [isOpen]);

  const handleAxisChange = (index: number, value: number) => {
    if (draft.axes[index]?.score === value) return;

    const hapticType = getTastingHapticType(value, draft.maxScore);
    if (hapticType) {
      handleWebViewMessage('triggerHaptic', { type: hapticType });
    }
    setActiveIndex(index);
    setDraft((prev) => ({
      ...prev,
      axes: prev.axes.map((axis, i) =>
        i === index ? { ...axis, score: value } : axis,
      ),
    }));
  };

  // 모달 닫기: pushState로 추가한 history entry를 제거 → popstate → onClose
  const handleBack = () => {
    window.history.back();
  };

  const handleComplete = () => {
    if (isDirty) {
      setValue('tastingProfile', draft, { shouldDirty: true });
    }
    closingRef.current = true;
    window.history.back();
  };

  const handleDiscard = () => {
    setIsDiscardConfirmOpen(false);
    closingRef.current = true;
    window.history.back();
  };

  const handleReset = () => {
    setActiveIndex(null);
    setDraft((prev) => ({
      ...prev,
      axes: prev.axes.map((axis) => ({ ...axis, score: 0 })),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 mx-auto flex max-w-content flex-col bg-bg-layer-default text-fg-neutral"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* 헤더 */}
          <header className="flex items-center justify-between border-b border-stroke-neutral-basement px-20 py-12 pt-safe-header">
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="flex items-center gap-4 text-14 text-fg-neutral-muted"
            >
              <Image
                src="/icon/arrow-left-subcoral.svg"
                alt=""
                width={20}
                height={20}
              />
            </button>
            <h2 className="text-16 font-bold text-fg-neutral">테이스팅 노트</h2>
            <button
              type="button"
              onClick={handleComplete}
              className="text-14 font-bold text-fg-brand"
            >
              완료
            </button>
          </header>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-y-auto px-20 pb-safe">
            {isDirty && isTastingProfileEmpty(draft) ? (
              <p className="mt-16 rounded-lg bg-bg-neutral-weak px-14 py-12 text-15 text-fg-neutral">
                모든 항목이 0점이면 테이스팅 노트가 저장되지 않아요.
              </p>
            ) : (
              <motion.div
                className="pt-20 pb-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-14 font-medium text-fg-neutral">
                  이 위스키에서 느낀 풍미를 기록해보세요
                </p>
                <p className="mt-4 text-12 text-fg-neutral-muted">
                  차트를 터치하거나 원을 드래그해서 조절하세요
                </p>
              </motion.div>
            )}

            {/* 레이더 차트 */}
            {draft.axes.length >= 3 && (
              <motion.div
                className="flex justify-center py-16"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              >
                <div className="w-280 h-280">
                  <TastingRadarChart
                    axes={draft.axes}
                    maxScore={draft.maxScore}
                    size={280}
                    activeIndex={activeIndex}
                    onAxisChange={handleAxisChange}
                  />
                </div>
              </motion.div>
            )}

            {/* 슬라이더 컨트롤들 */}
            <div className="flex flex-col gap-10 mt-8">
              {draft.axes.map((axis, i) => {
                const [minHint, maxHint] = getTastingAxisHints(axis);
                return (
                  <motion.div
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${axis.name}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                  >
                    <FlavorAxisControl
                      label={axis.name}
                      descriptor={axis.description}
                      minHint={minHint}
                      maxHint={maxHint}
                      value={axis.score}
                      max={draft.maxScore}
                      originalValue={originalScores.get(axis.name)}
                      onChange={(v) => handleAxisChange(i, v)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* 초기화 버튼 */}
            <div className="flex justify-center mt-24 pb-24">
              <button
                type="button"
                onClick={handleReset}
                className="text-13 text-fg-neutral-muted underline underline-offset-2"
              >
                초기화
              </button>
            </div>
          </div>

          {isDiscardConfirmOpen && (
            <TastingConfirmDialog
              title="수정한 내용을 버릴까요?"
              cancelLabel="계속 수정"
              confirmLabel="버리기"
              onCancel={() => setIsDiscardConfirmOpen(false)}
              onConfirm={handleDiscard}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
