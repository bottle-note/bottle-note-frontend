import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { ExploreReview } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/app/api/ExploreApi';
import List from '@/components/feature/List/List';
import Label from '@/components/ui/Display/Label';
import ReviewCard from './ReviewListItem';
import { SearchBar, type SearchKeyword } from './SearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';

export const ReviewExplorerList = () => {
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);

  const keywordValues = keywords.map((keyword) => keyword.value);

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
    queryKey: ['explore.reviews', ...keywordValues],
    queryFn: ({ pageParam }) => {
      return ExploreApi.getReviews({
        keywords: keywordValues,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
  });

  const handleAddKeyword = (newKeyword: SearchKeyword) => {
    setKeywords((prev) => {
      if (prev.some((keyword) => keyword.value === newKeyword.value)) {
        return prev;
      }

      return [...prev, newKeyword];
    });
  };

  const handleRemoveKeyword = (keywordValueToRemove: string) => {
    setKeywords((prev) =>
      prev.filter((keyword) => keyword.value !== keywordValueToRemove),
    );
  };

  return (
    <section className="pb-20">
      <SearchBar
        handleSearch={refetch}
        handleAddKeyword={handleAddKeyword}
        description={`보고싶은 리뷰의 내용, 플레이버태그, 작성자, 위스키이름을\n 추가하여 검색해보세요.`}
        handleRemoveKeyword={handleRemoveKeyword}
        activeKeywords={keywords}
      />
      <article className="flex gap-x-1 gap-y-1.5 flex-wrap">
        {keywords.map((keyword) => (
          <div key={keyword.value} className="overflow-hidden flex-shrink-0">
            <Label
              name={keyword.label}
              styleClass="label-default text-12"
              position="after"
              icon={
                <button
                  type="button"
                  onMouseDown={() => handleRemoveKeyword(keyword.value)}
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
            [...reviewList].map((listData) =>
              listData.data.items
                .flat()
                .map((review) => <ReviewCard key={uuid()} content={review} />),
            )}
          <div ref={targetRef} className="h-10" />
        </List.Section>
      </List>
    </section>
  );
};
