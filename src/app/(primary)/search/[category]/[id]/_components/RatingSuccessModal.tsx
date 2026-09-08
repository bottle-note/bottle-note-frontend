'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Button from '@/components/ui/Button/Button';
import BackDrop from '@/components/ui/Modal/BackDrop';
import { handleWebViewMessage } from '@/utils/flutterUtil';
import styles from './RatingSuccessModal.module.css';

interface RatingSuccessModalProps {
  isOpen: boolean;
  rating: number;
  onClose: () => void;
}

const CONFETTI = [
  ['-118px', '-90px', '32deg', '.00s'],
  ['-88px', '-138px', '-52deg', '.03s'],
  ['-36px', '-154px', '74deg', '.06s'],
  ['24px', '-150px', '-28deg', '.02s'],
  ['82px', '-128px', '58deg', '.07s'],
  ['122px', '-82px', '-70deg', '.04s'],
  ['-132px', '-32px', '96deg', '.08s'],
  ['136px', '-18px', '22deg', '.01s'],
  ['-104px', '22px', '-34deg', '.05s'],
  ['104px', '34px', '84deg', '.09s'],
] as const;

export default function RatingSuccessModal({
  isOpen,
  rating,
  onClose,
}: RatingSuccessModalProps) {
  const confirmButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeTimer = window.setTimeout(onClose, 4200);
    const hapticTimer = window.setTimeout(() => {
      handleWebViewMessage('triggerHaptic', { type: 'medium' });
    }, 50);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => {
      confirmButtonContainerRef.current?.querySelector('button')?.focus();
    });

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(hapticTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <BackDrop isShow={isOpen} isModal={false}>
      <div
        className={`${styles.backdrop} bg-bg-overlay-muted backdrop-blur-[3px]`}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
        tabIndex={-1}
      >
        <div aria-hidden="true" className={styles.confetti}>
          {CONFETTI.map(([x, y, rotation, delay], index) => (
            <i
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={styles.confettiPiece}
              style={
                {
                  '--x': x,
                  '--y': y,
                  '--r': rotation,
                  '--d': delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div aria-hidden="true" className={`${styles.ring} ${styles.ring1}`} />
        <div aria-hidden="true" className={`${styles.ring} ${styles.ring2}`} />
        <section
          aria-labelledby="rating-success-title"
          aria-modal="true"
          className={styles.card}
          role="dialog"
        >
          <div aria-hidden="true" className={styles.heroStar}>
            ★
          </div>
          <p className={styles.kicker}>평가 완료!</p>
          <p className={styles.score}>{rating.toFixed(1)}</p>
          <p id="rating-success-title" className={styles.message}>
            완료됐습니다!
          </p>
          <div ref={confirmButtonContainerRef} className={styles.confirmButton}>
            <Button
              btnName="확인"
              onClick={onClose}
              btnStyles="bg-bg-brand-solid active:bg-bg-brand-solid-pressed"
              btnTextStyles="font-bold text-16"
            />
          </div>
        </section>
      </div>
    </BackDrop>
  );
}
