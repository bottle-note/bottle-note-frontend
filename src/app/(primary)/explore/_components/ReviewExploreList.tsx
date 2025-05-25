import { ExploreReview } from '@/types/Explore';
import ReviewCard from './ReviewCard';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/app/api/ExploreApi';
import { SearchBar } from './SearchBar';

export const ReviewExplorerList = () => {
  const [keywords, setKeywords] = useState<string[]>([]);

  const {
    data: reviewList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
    error,
  } = usePaginatedQuery<{
    items: ExploreReview[];
  }>({
    queryKey: ['explore.reviews'],
    queryFn: ({ pageParam }) => {
      return ExploreApi.getReviews({
        keywords,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section>
      <SearchBar />
      <article className="space-y-[30px] divide-y-[1px]">
        {reviewList &&
          reviewList[0].data.items.map((review) => (
            <>{<ReviewCard key={uuid()} content={review} />}</>
          ))}
        <div ref={targetRef} />
      </article>
    </section>
  );
};
