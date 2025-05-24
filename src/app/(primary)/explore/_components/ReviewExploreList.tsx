import { ExploreReview } from '@/types/Explore';
import ReviewCard from './ReviewCard';

interface Props {
  list: ExploreReview[];
}

export const ReviewExplorerList = ({ list }: Props) => {
  return (
    <div className="space-y-[30px] divide-y-[1px]">
      {list.map((review) => (
        <>
          <ReviewCard key={review.reviewId} content={review} />
        </>
      ))}
    </div>
  );
};
