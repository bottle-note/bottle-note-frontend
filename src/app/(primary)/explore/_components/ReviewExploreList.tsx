import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/api/explore/explore.api';
import { ExploreReview } from '@/api/explore/types';
import List from '@/components/feature/List/List';
import ReviewCard from './ReviewListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import { ExploreKeywordChip } from './ExploreKeywordChip';
import { useExploreKeywords } from '../_hooks/useExploreKeywords';

const REVIEW_TAB_ID = 'REVIEW_WHISKEY';

export const ReviewExplorerList = () => {
  const { keywords, keywordValues, handleAddKeyword, handleRemoveKeyword } =
    useExploreKeywords({ tabId: REVIEW_TAB_ID });

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

  return (
    <section className="pb-20">
      <ExploreSearchBar
        handleSearch={refetch}
        handleAddKeyword={handleAddKeyword}
        description={`보고싶은 리뷰의 내용, 플레이버태그, 작성자, 위스키이름을\n 추가하여 검색해보세요.`}
      />
      <article className="flex gap-x-1 gap-y-1.5 flex-wrap">
        {keywords.map((keyword) => (
          <div key={keyword.value} className="overflow-hidden flex-shrink-0">
            <ExploreKeywordChip
              keyword={keyword}
              onRemove={handleRemoveKeyword}
              textClassName="text-12"
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
            [...reviewList].map((listData, pageIndex) =>
              listData.data.items
                .flat()
                .map((review, itemIndex) => (
                  <ReviewCard
                    key={review.reviewId}
                    content={review}
                    priority={pageIndex === 0 && itemIndex === 0}
                  />
                )),
            )}
          <div ref={targetRef} className="h-10" />
        </List.Section>
      </List>
    </section>
  );
};
