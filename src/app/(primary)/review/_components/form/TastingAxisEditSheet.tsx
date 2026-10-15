'use client';

import React, { useEffect, useRef, useState } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import Button from '@/components/ui/Button/Button';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import type { ReviewTastingProfile } from '@/api/review/types';
import {
  TASTING_AXIS_MAX_COUNT,
  TASTING_AXIS_MIN_COUNT,
  TASTING_AXIS_NAME_MAX_LENGTH,
  buildTastingAxisSuggestions,
  isDefaultTastingProfile,
  type TastingProfileAxis,
} from '@/api/review/tastingProfile';
import TastingConfirmDialog from './TastingConfirmDialog';

interface Props {
  isOpen: boolean;
  profile: ReviewTastingProfile;
  /** 항목 이름 추천 후보 (앞쪽이 우선) */
  suggestionSources: (string[] | null | undefined)[];
  onClose: () => void;
  onApply: (axes: TastingProfileAxis[]) => void;
  onResetToDefault: () => void;
}

interface Row {
  key: number;
  name: string;
  /** 편집 전 항목. 새로 추가한 행은 null */
  source: TastingProfileAxis | null;
}

interface RemovedRow {
  row: Row;
  index: number;
}

const UNDO_DURATION = 4000;

const isBlankNewRow = (row: Row) => !row.source && !row.name.trim();

/** 이름을 바꾼 기본 항목은 원래 설명·코드와 맞지 않으므로 사용자 정의 항목으로 저장한다. */
function toAxis(row: Row): TastingProfileAxis {
  const name = row.name.trim();
  if (row.source && name === row.source.name) return row.source;
  return {
    code: null,
    name,
    description: null,
    score: row.source?.score ?? 0,
  };
}

function getRowErrors(rows: Row[]): (string | null)[] {
  const seen = new Set<string>();
  return rows.map((row) => {
    const name = row.name.trim();
    if (!name) return row.source ? '이름을 입력해 주세요.' : null;
    if (seen.has(name)) return '이미 있는 이름이에요.';
    seen.add(name);
    return null;
  });
}

export default function TastingAxisEditSheet({
  isOpen,
  profile,
  suggestionSources,
  onClose,
  onApply,
  onResetToDefault,
}: Props) {
  const isKeyboardVisible = useKeyboardVisible();
  const [rows, setRows] = useState<Row[]>([]);
  const [addingKey, setAddingKey] = useState<number | null>(null);
  const [removed, setRemoved] = useState<RemovedRow | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const nextKeyRef = useRef(0);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setRows(
      profile.axes.map((axis) => ({
        key: nextKeyRef.current++,
        name: axis.name,
        source: axis,
      })),
    );
    setAddingKey(null);
    setRemoved(null);
    setIsResetConfirmOpen(false);
  }, [isOpen, profile]);

  useEffect(
    () => () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    },
    [],
  );

  const errors = getRowErrors(rows);
  const filledRows = rows.filter((row) => !isBlankNewRow(row));
  const nextAxes = filledRows.map(toAxis);
  const canRemove = filledRows.length > TASTING_AXIS_MIN_COUNT;
  const isFull = rows.length >= TASTING_AXIS_MAX_COUNT;
  const hasBlankNewRow = rows.some(isBlankNewRow);
  const hasErrors = errors.some(Boolean);
  const isDefault = isDefaultTastingProfile({ ...profile, axes: nextAxes });
  const addingRow = rows.find((row) => row.key === addingKey);
  const suggestions =
    addingRow && !addingRow.name.trim()
      ? buildTastingAxisSuggestions(
          suggestionSources,
          rows.map((row) => row.name),
        )
      : [];

  const updateName = (key: number, name: string) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, name } : row)),
    );
  };

  const handleAdd = () => {
    const key = nextKeyRef.current++;
    setRows((prev) => [...prev, { key, name: '', source: null }]);
    setAddingKey(key);
  };

  const handleRemove = (index: number) => {
    const row = rows[index];
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (isBlankNewRow(row)) return;

    setRemoved({ row, index });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setRemoved(null), UNDO_DURATION);
  };

  const handleUndo = () => {
    if (!removed) return;
    setRows((prev) => {
      const next = [...prev];
      next.splice(Math.min(removed.index, next.length), 0, removed.row);
      return next;
    });
    setRemoved(null);
  };

  const handleComplete = () => {
    if (hasErrors) return;
    onApply(nextAxes);
  };

  const scoredSummary = profile.axes
    .filter((axis) => axis.score > 0)
    .map((axis) => `${axis.name} ${axis.score}`)
    .join(' · ');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height={85}
      className="z-[60]"
      overlayClassName="z-[55]"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-baseline gap-8 px-20 pb-8 pt-16">
          <h3 className="text-17 font-bold text-fg-neutral">항목 편집</h3>
          <span className="text-13 font-medium text-fg-neutral-muted">
            {filledRows.length} / {TASTING_AXIS_MAX_COUNT}
          </span>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto pb-16">
          {rows.map((row, index) => {
            const error = errors[index];
            const isRemovable = canRemove || isBlankNewRow(row);
            return (
              <li key={row.key} className="px-20 py-6">
                <div className="flex items-center gap-10">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={!isRemovable}
                    aria-label={`${row.name.trim() || '새 항목'} 삭제`}
                    className="relative h-24 w-24 shrink-0 rounded-full bg-destructive disabled:bg-bg-disabled"
                  >
                    <span className="absolute left-6 right-6 top-1/2 h-2 -translate-y-1/2 rounded-full bg-palette-static-white" />
                  </button>
                  <input
                    type="text"
                    aria-label={`항목 ${index + 1} 이름`}
                    aria-invalid={Boolean(error)}
                    value={row.name}
                    maxLength={TASTING_AXIS_NAME_MAX_LENGTH}
                    placeholder="항목 이름"
                    autoFocus={row.key === addingKey}
                    onFocus={(e) =>
                      e.currentTarget.scrollIntoView?.({ block: 'center' })
                    }
                    onChange={(e) => updateName(row.key, e.target.value)}
                    className={`h-44 min-w-0 flex-1 rounded-lg border px-12 text-16 text-fg-neutral placeholder:text-fg-placeholder focus:outline-none ${
                      error
                        ? 'border-destructive'
                        : 'border-stroke-neutral-basement focus:border-stroke-focus-ring'
                    }`}
                  />
                </div>
                {error && (
                  <p className="mt-4 pl-34 text-15 text-destructive">{error}</p>
                )}
                {row.key === addingKey && suggestions.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-6 pl-34">
                    {suggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => updateName(row.key, name)}
                        className="h-32 rounded-full border border-stroke-neutral-basement px-12 text-13 text-fg-neutral"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {!canRemove && (
            <li className="px-20 pt-4 pl-54 text-15 text-fg-neutral">
              {TASTING_AXIS_MIN_COUNT}개 이상 필요해요.
            </li>
          )}
          <li className="px-20 pt-6">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isFull || hasBlankNewRow}
              className="flex h-44 items-center gap-10 text-15 font-bold text-fg-brand disabled:text-fg-disabled"
            >
              <span
                aria-hidden
                className="flex h-24 w-24 items-center justify-center rounded-full bg-bg-brand-solid text-18 font-medium text-palette-static-white"
              >
                +
              </span>
              항목 추가
              {isFull && (
                <span className="text-13 font-normal text-fg-neutral-muted">
                  최대 {TASTING_AXIS_MAX_COUNT}개
                </span>
              )}
            </button>
          </li>
        </ul>

        {removed && (
          <div className="absolute inset-x-20 bottom-[calc(140px+var(--safe-area-bottom))] flex items-center justify-between rounded-lg bg-bg-neutral-solid px-16 py-14 text-14 text-fg-neutral-inverted">
            <span>{removed.row.name.trim()} 삭제됨</span>
            <button
              type="button"
              onClick={handleUndo}
              className="font-bold text-fg-brand-primary"
            >
              되돌리기
            </button>
          </div>
        )}

        {!isKeyboardVisible && (
          <div className="flex flex-col items-center gap-14 px-20 pb-[calc(12px+var(--safe-area-bottom))] pt-8">
            {!isDefault && (
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-13 text-fg-neutral-muted underline underline-offset-2"
              >
                기본 6항목으로 되돌리기
              </button>
            )}
            <Button onClick={handleComplete} disabled={hasErrors}>
              완료
            </Button>
          </div>
        )}

        {isResetConfirmOpen && (
          <TastingConfirmDialog
            title="기본 6항목으로 되돌릴까요?"
            description={
              scoredSummary
                ? `${scoredSummary} 기록이 지워져요.`
                : '기본 6항목으로 다시 시작해요.'
            }
            cancelLabel="취소"
            confirmLabel="되돌리기"
            onCancel={() => setIsResetConfirmOpen(false)}
            onConfirm={onResetToDefault}
          />
        )}
      </div>
    </BottomSheet>
  );
}
