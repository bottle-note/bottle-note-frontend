import { ExploreReview } from '@/types/Explore';
import ReviewCard from './ReviewCard';
import { v4 as uuid } from 'uuid';

interface Props {
  list: ExploreReview[];
}

export const ReviewExplorerList = ({ list }: Props) => {
  return (
    <div className="space-y-[30px] divide-y-[1px]">
      {list.map((review) => (
        <>
          <ReviewCard key={uuid()} content={review} />
        </>
      ))}
    </div>
  );
};
