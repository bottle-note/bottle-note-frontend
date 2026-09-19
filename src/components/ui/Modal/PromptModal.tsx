'use client';

import { useId } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import BackDrop from '@/components/ui/Modal/BackDrop';

interface Props {
  mainText: string;
  subText: string;
  actionText: string;
  onAction: () => void;
  onClose: () => void;
  closeText?: string;
}

function PromptModal({
  mainText,
  subText,
  actionText,
  onAction,
  onClose,
  closeText = '다음에 할게요',
}: Props) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <BackDrop isShow>
      <div className="content-container flex h-full w-full flex-col items-center justify-end gap-3 px-4 pb-safe">
        <section
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative flex w-full flex-col items-center space-y-3 rounded-xl bg-bg-layer-floating px-4 pt-20 text-center text-fg-neutral"
          role="dialog"
        >
          <div className="absolute top-[-10px]">
            <Image
              src="/icon/logo-subcoral.svg"
              alt=""
              aria-hidden="true"
              width={50}
              height={60}
              style={{ width: 50, height: 60 }}
              priority
            />
          </div>
          <div>
            <p id={titleId} className="modal-mainText">
              {mainText}
            </p>
            <p id={descriptionId} className="modal-subText">
              {subText}
            </p>
          </div>
          <Button btnName={actionText} onClick={onAction} />
          <button
            type="button"
            className="pb-3 text-10 text-fg-neutral-muted"
            onClick={onClose}
          >
            {closeText}
          </button>
        </section>
      </div>
    </BackDrop>
  );
}

export default PromptModal;
