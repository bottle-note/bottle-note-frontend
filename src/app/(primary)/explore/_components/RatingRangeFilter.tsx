import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EXPLORE_RATING_VALUES,
  formatExploreRating,
  type ExploreRating,
  type ExploreRatingRange,
} from '../_constants/exploreFilters';

type ActiveBoundary = 'from' | 'to';

interface RatingRangeFilterProps {
  ratingRange?: ExploreRatingRange;
  onSelectRatingRange: (
    firstRating: ExploreRating,
    secondRating: ExploreRating,
  ) => void;
  onClear: () => void;
}

export const RatingRangeFilter = ({
  ratingRange,
  onSelectRatingRange,
  onClear,
}: RatingRangeFilterProps) => {
  const [activeBoundary, setActiveBoundary] = useState<ActiveBoundary>('from');

  const selectRating = (rating: ExploreRating) => {
    if (!ratingRange) {
      onSelectRatingRange(rating, rating);
      setActiveBoundary('to');
      return;
    }

    const otherRating =
      activeBoundary === 'from' ? ratingRange.ratingTo : ratingRange.ratingFrom;

    onSelectRatingRange(rating, otherRating);

    if (rating < otherRating) {
      setActiveBoundary('to');
    } else if (rating > otherRating) {
      setActiveBoundary('from');
    } else {
      setActiveBoundary(activeBoundary === 'from' ? 'to' : 'from');
    }
  };

  const clearRating = () => {
    setActiveBoundary('from');
    onClear();
  };

  const isAllSelected = ratingRange === undefined;
  const selectedRangeText = !ratingRange
    ? '별점 전체가 선택됐어요.'
    : ratingRange.ratingFrom === ratingRange.ratingTo
      ? `${formatExploreRating(ratingRange.ratingFrom)}점만 선택됐어요.`
      : `${formatExploreRating(ratingRange.ratingFrom)}점부터 ${formatExploreRating(ratingRange.ratingTo)}점까지 선택됐어요.`;

  const boundaryClassName = (boundary: ActiveBoundary) =>
    cn(
      'flex h-10 flex-1 items-center justify-center gap-1 rounded border text-12 font-semibold',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring',
      activeBoundary === boundary
        ? 'border-stroke-brand-solid bg-bg-brand-weak text-fg-brand'
        : 'border-stroke-neutral-subtle bg-bg-layer-default text-fg-neutral-muted',
    );

  return (
    <div>
      <button
        type="button"
        aria-pressed={isAllSelected}
        className={cn(
          'mb-2 flex h-9 w-full items-center justify-center gap-2 rounded border text-11 font-semibold',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring',
          isAllSelected
            ? 'border-stroke-brand-solid bg-bg-brand-solid text-fg-brand-contrast'
            : 'border-stroke-neutral-subtle bg-bg-layer-default text-fg-neutral-muted',
        )}
        onClick={clearRating}
      >
        별점 전체
        {isAllSelected && <Check aria-hidden className="h-4 w-4" />}
      </button>

      <div
        role="group"
        aria-label="별점 범위 경계"
        className="mb-2 flex items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={activeBoundary === 'from'}
          className={boundaryClassName('from')}
          onClick={() => setActiveBoundary('from')}
        >
          <Star aria-hidden className="h-3.5 w-3.5 fill-current" />
          {ratingRange ? formatExploreRating(ratingRange.ratingFrom) : '최소'}
        </button>
        <span aria-hidden className="text-12 text-fg-neutral-subtle">
          ~
        </span>
        <button
          type="button"
          aria-pressed={activeBoundary === 'to'}
          className={boundaryClassName('to')}
          onClick={() => setActiveBoundary('to')}
        >
          <Star aria-hidden className="h-3.5 w-3.5 fill-current" />
          {ratingRange ? formatExploreRating(ratingRange.ratingTo) : '최대'}
        </button>
      </div>

      <div
        role="group"
        aria-label="별점 점수"
        className="grid grid-cols-5 gap-1"
      >
        {EXPLORE_RATING_VALUES.map((rating) => {
          const isSelected =
            ratingRange !== undefined &&
            rating >= ratingRange.ratingFrom &&
            rating <= ratingRange.ratingTo;

          return (
            <button
              type="button"
              aria-label={`${formatExploreRating(rating)}점`}
              aria-pressed={isSelected}
              className={cn(
                'flex h-11 min-w-0 items-center justify-center gap-0.5 rounded border px-1 text-10 font-semibold',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring',
                isSelected
                  ? 'border-stroke-brand-solid bg-bg-brand-solid text-fg-brand-contrast'
                  : 'border-stroke-neutral-subtle bg-bg-layer-default text-fg-rating hover:bg-bg-layer-default-pressed',
              )}
              onClick={() => selectRating(rating)}
              key={rating}
            >
              <Star aria-hidden className="h-3 w-3 shrink-0 fill-current" />
              <span>{formatExploreRating(rating)}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-2 text-11 text-fg-neutral-subtle">
        {selectedRangeText}
      </p>
    </div>
  );
};
