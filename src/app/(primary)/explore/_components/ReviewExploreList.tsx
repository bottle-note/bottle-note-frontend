import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { ExploreReview } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/app/api/ExploreApi';
import List from '@/components/List/List';
import ReviewCard from './ReviewListItem';
import { SearchBar } from './SearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';
import Label from '../../_components/Label';

export const ReviewExplorerList = () => {
  const [keywords, setKeywords] = useState<Set<string>>(new Set());

  const {
    data: reviewList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
    error,
    refetch,
  } = usePaginatedQuery<{
    items: ExploreReview[];
  }>({
    queryKey: ['explore.reviews', keywords],
    queryFn: ({ pageParam }) => {
      return ExploreApi.getReviews({
        keywords: Array.from(keywords),
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleAddKeyword = (newKeyword: string) => {
    setKeywords((prev) => new Set(prev).add(newKeyword));
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords((prev) => {
      const newSet = new Set(prev);
      newSet.delete(keywordToRemove);
      return newSet;
    });
  };

  return (
    <section>
      <SearchBar
        handleSearch={refetch}
        handleAddKeyword={handleAddKeyword}
        description={`보고싶은 리뷰의 내용, 플레이버태그, 작성자, 위스키이름을\n 추가하여 검색해보세요.`}
        handleRemoveKeyword={handleRemoveKeyword}
      />
      <article className="flex gap-x-1 gap-y-1.5 flex-wrap">
        {Array.from(keywords).map((keyword) => (
          <div key={keyword} className="overflow-hidden flex-shrink-0">
            <Label
              name={keyword}
              styleClass="label-default text-12"
              position="after"
              icon={
                <button
                  type="button"
                  onMouseDown={() => handleRemoveKeyword(keyword)}
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
      <List
        isListFirstLoading={isFirstLoading}
        isError={!!error}
        isScrollLoading={isFetching}
        isEmpty={
          !isFirstLoading &&
          (!reviewList || reviewList[0]?.data.items.length === 0)
        }
      >
        <List.Section className="space-y-[30px] divide-y-[1px]">
          {reviewList &&
            reviewList[0].data.items.map((review) => (
              <ReviewCard key={uuid()} content={review} />
            ))}
        </List.Section>
        <div ref={targetRef} />
      </List>
    </section>
  );
};
