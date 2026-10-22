'use client';

import React from 'react';
import { DualButton } from '@/components/ui/Button/Button';

interface Props {
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 테이스팅 모달·항목 시트 위에 띄우는 확인창.
 * 전역 Modal은 테이스팅 모달보다 아래 층에 그려지므로 부모 레이어 안에 직접 둔다.
 */
export default function TastingConfirmDialog({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-overlay px-24">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="tasting-confirm-title"
        className="flex w-full flex-col gap-20 rounded-xl bg-bg-layer-floating px-20 pb-20 pt-28 text-center"
      >
        <div className="flex flex-col gap-4">
          <p
            id="tasting-confirm-title"
            className="text-16 font-bold text-fg-neutral"
          >
            {title}
          </p>
          {description && (
            <p className="text-15 text-fg-neutral-muted">{description}</p>
          )}
        </div>
        <DualButton
          cancelBtnName={cancelLabel}
          okayBtnName={confirmLabel}
          onClickCancel={onCancel}
          onClickOkay={onConfirm}
        />
      </div>
    </div>
  );
}
