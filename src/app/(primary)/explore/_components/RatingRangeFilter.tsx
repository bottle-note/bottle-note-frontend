import { useState } from 'react';
import { Star } from 'lucide-react';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
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

  return (
    <>
      <Accordion.Single>
        <Accordion.Content
          title="별점 전체"
          value="all"
          isSelected={ratingRange === undefined}
          onClick={clearRating}
        />
      </Accordion.Single>

      <Accordion.Grid cols={2}>
        <Accordion.Content
          title={
            ratingRange
              ? `최소 ${formatExploreRating(ratingRange.ratingFrom)}점`
              : '최소'
          }
          value="from"
          IconComponent={Star}
          isSelected={ratingRange !== undefined && activeBoundary === 'from'}
          onClick={() => setActiveBoundary('from')}
        />
        <Accordion.Content
          title={
            ratingRange
              ? `최대 ${formatExploreRating(ratingRange.ratingTo)}점`
              : '최대'
          }
          value="to"
          IconComponent={Star}
          isSelected={ratingRange !== undefined && activeBoundary === 'to'}
          onClick={() => setActiveBoundary('to')}
        />
      </Accordion.Grid>

      <div className="mt-1">
        <Accordion.Grid cols={2}>
          {EXPLORE_RATING_VALUES.map((rating) => (
            <Accordion.Content
              title={`${formatExploreRating(rating)}점`}
              value={String(rating)}
              IconComponent={Star}
              isSelected={
                ratingRange !== undefined &&
                rating >= ratingRange.ratingFrom &&
                rating <= ratingRange.ratingTo
              }
              onClick={() => selectRating(rating)}
              key={rating}
            />
          ))}
        </Accordion.Grid>
      </div>
    </>
  );
};
