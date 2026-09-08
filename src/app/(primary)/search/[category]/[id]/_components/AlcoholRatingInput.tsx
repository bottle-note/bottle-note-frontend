'use client';

import { useRef, useState } from 'react';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import { handleWebViewMessage } from '@/utils/flutterUtil';

interface AlcoholRatingInputProps {
  value: number;
  onCommit: (rating: number) => void;
}

const MIN_RATING = 0.5;
const MAX_RATING = 5;
const RATING_STEP = 0.5;
const STAR_SIZE = 42;
const STAR_CELL_WIDTH = 52;
const STAR_CELL_HEIGHT = 54;

const clampRating = (rating: number) =>
  Math.max(
    MIN_RATING,
    Math.min(MAX_RATING, Math.round(rating / RATING_STEP) * RATING_STEP),
  );

const getFillRatio = (rating: number, index: number) =>
  Math.max(0, Math.min(1, rating - index));

export default function AlcoholRatingInput({
  value,
  onCommit,
}: AlcoholRatingInputProps) {
  const [previewRate, setPreviewRate] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastHapticRateRef = useRef<number | null>(null);
  const keyboardRateRef = useRef<number | null>(null);

  const displayedRate = previewRate ?? value;

  const updatePreview = (nextRate: number) => {
    const rating = clampRating(nextRate);
    setPreviewRate(rating);

    if (lastHapticRateRef.current !== rating) {
      lastHapticRateRef.current = rating;
      handleWebViewMessage('triggerHaptic', { type: 'selection' });
    }

    return rating;
  };

  const getRatingFromPosition = (
    event: React.PointerEvent<HTMLInputElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const progress = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );

    return clampRating(MIN_RATING + progress * (MAX_RATING - MIN_RATING));
  };

  const resetInteraction = () => {
    pointerIdRef.current = null;
    keyboardRateRef.current = null;
    lastHapticRateRef.current = null;
    setIsInteracting(false);
    setPreviewRate(null);
  };

  const finishInteraction = (rating: number) => {
    resetInteraction();
    onCommit(rating);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    pointerIdRef.current = event.pointerId;
    lastHapticRateRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsInteracting(true);
    updatePreview(getRatingFromPosition(event));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLInputElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    updatePreview(getRatingFromPosition(event));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLInputElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;

    const rating = updatePreview(getRatingFromPosition(event));
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishInteraction(rating);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const isRatingKey = [
      'ArrowLeft',
      'ArrowDown',
      'ArrowRight',
      'ArrowUp',
      'Home',
      'End',
    ].includes(event.key);

    if (!isRatingKey) return;

    event.preventDefault();

    const currentRating = keyboardRateRef.current ?? previewRate ?? value;
    let nextRating = currentRating || MIN_RATING;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      nextRating = Math.max(MIN_RATING, nextRating - RATING_STEP);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      nextRating = currentRating === 0 ? MIN_RATING : nextRating + RATING_STEP;
    }
    if (event.key === 'Home') nextRating = MIN_RATING;
    if (event.key === 'End') nextRating = MAX_RATING;

    keyboardRateRef.current = updatePreview(nextRating);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!keyboardRateRef.current) return;
    if (
      ![
        'ArrowLeft',
        'ArrowDown',
        'ArrowRight',
        'ArrowUp',
        'Home',
        'End',
      ].includes(event.key)
    ) {
      return;
    }

    finishInteraction(keyboardRateRef.current);
  };

  return (
    <div
      className="relative"
      style={{
        width: `${STAR_CELL_WIDTH * 5}px`,
        height: `${STAR_CELL_HEIGHT}px`,
      }}
    >
      <div className="pointer-events-none flex">
        {Array.from({ length: 5 }, (_, index) => {
          const fillRatio = getFillRatio(displayedRate, index);
          const isActive =
            isInteracting && index === Math.ceil(displayedRate) - 1;

          return (
            <div
              key={index}
              className={`flex items-center justify-center transition-transform duration-100 ease-out ${
                isActive ? 'scale-[1.14]' : ''
              }`}
              style={{
                width: `${STAR_CELL_WIDTH}px`,
                height: `${STAR_CELL_HEIGHT}px`,
              }}
            >
              <div
                className="relative text-fg-rating"
                style={{ width: `${STAR_SIZE}px`, height: `${STAR_SIZE}px` }}
              >
                <SemanticIcon
                  src="/icon/star-outlined-subcoral.svg"
                  width={STAR_SIZE}
                  height={STAR_SIZE}
                  className="absolute inset-0"
                />
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fillRatio * 100}%` }}
                >
                  <SemanticIcon
                    src="/icon/star-filled-subcoral.svg"
                    width={STAR_SIZE}
                    height={STAR_SIZE}
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <input
        aria-label="내 별점"
        aria-valuetext={
          displayedRate > 0 ? `${displayedRate.toFixed(1)}점` : '평가 없음'
        }
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 touch-pan-y"
        max={MAX_RATING}
        min={0}
        onBlur={resetInteraction}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerCancel={resetInteraction}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        step={RATING_STEP}
        type="range"
        value={displayedRate}
      />
    </div>
  );
}
