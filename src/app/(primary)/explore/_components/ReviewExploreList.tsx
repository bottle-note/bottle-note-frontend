import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { ExploreReview } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/app/api/ExploreApi';
import ReviewCard from './ReviewCard';
import { SearchBar } from './SearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';
import Label from '../../_components/Label';

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
      <article>
        {keywords.map((keyword) => (
          <div key={keyword} className="overflow-hidden flex-shrink-0">
            <Label
              name={keyword}
              styleClass="label-default text-12"
              position="after"
              icon={
                <button
                  type="button"
                  onMouseDown={() => {}}
                  className=""
                  aria-label="검색어 지우기"
                >
                  <Image src={DeleteIcon} alt="delete" />
                </button>
              }
            />
          </div>
        ))}
      </article>
      <article className="space-y-[30px] divide-y-[1px]">
        {reviewList &&
          reviewList[0].data.items.map((review) => (
            <ReviewCard key={uuid()} content={review} />
          ))}
        <div ref={targetRef} />
      </article>
    </section>
  );
};
