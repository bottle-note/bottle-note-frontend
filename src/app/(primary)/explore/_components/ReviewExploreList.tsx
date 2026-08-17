import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import {
  type VirtualItem,
  useWindowVirtualizer,
} from '@tanstack/react-virtual';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/api/explore/explore.api';
import { ExploreReview } from '@/api/explore/types';
import type { ApiResponse } from '@/api/_shared/types';
import List from '@/components/feature/List/List';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import ReviewCard from './ReviewListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import { ExploreKeywordChip } from './ExploreKeywordChip';
import { useExploreKeywords } from '../_hooks/useExploreKeywords';
import { REVIEW_EXPLORE_TAB_ID } from '../_constants/exploreTabs';

interface ReviewExplorerListProps {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
}

interface ReviewListData {
  items: ExploreReview[];
}

const ESTIMATED_REVIEW_ITEM_HEIGHT = 320;
const REVIEW_LIST_OVERSCAN = 3;
let reviewMeasurementCache:
  | { queryKey: string; measurements: VirtualItem[] }
  | undefined;

export const ReviewExplorerList = ({
  isSearchActive,
  onSearchActiveChange,
}: ReviewExplorerListProps) => {
  const queryClient = useQueryClient();
  const { isScrollVisible } = useNavLayout();
  const { user } = useAuthSession();
  const { keywords, keywordValues, handleAddKeyword, handleRemoveKeyword } =
    useExploreKeywords({ tabId: REVIEW_EXPLORE_TAB_ID });

  const queryKey = useMemo(
    () => [
      'explore.reviews',
      user?.userId ?? null,
      ...keywords.map((keyword) => keyword.value),
    ],
    [keywords, user?.userId],
  );
  const measurementCacheKey = JSON.stringify(queryKey);

  const {
    data: reviewList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
    error,
    refetch,
  } = usePaginatedQuery<ReviewListData>({
    queryKey,
    queryFn: ({ pageParam }) => {
      return ExploreApi.getReviews({
        keywords: keywordValues,
        ...{
          cursor: pageParam,
          size: 10,
        },
      });
    },
  });

  const reviews = useMemo(
    () => reviewList?.flatMap((listData) => listData.data.items) ?? [],
    [reviewList],
  );
  const reviewCount = reviews.length;
  const listRef = useRef<HTMLDivElement>(null);
  const [listOffset, setListOffset] = useState(0);
  const getItemKey = useCallback(
    (index: number) => reviews[index]?.reviewId ?? index,
    [reviews],
  );
  const virtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: reviewCount,
    estimateSize: () => ESTIMATED_REVIEW_ITEM_HEIGHT,
    getItemKey,
    initialMeasurementsCache:
      reviewMeasurementCache?.queryKey === measurementCacheKey
        ? reviewMeasurementCache.measurements
        : [],
    overscan: REVIEW_LIST_OVERSCAN,
    scrollMargin: listOffset,
    useFlushSync: false,
  });

  useLayoutEffect(() => {
    const updateListOffset = () => {
      if (!listRef.current) return;

      const nextOffset =
        listRef.current.getBoundingClientRect().top + window.scrollY;
      setListOffset((currentOffset) =>
        Math.abs(currentOffset - nextOffset) < 1 ? currentOffset : nextOffset,
      );
    };

    updateListOffset();
    const transitionTimer = window.setTimeout(updateListOffset, 160);
    window.addEventListener('resize', updateListOffset);

    return () => {
      window.clearTimeout(transitionTimer);
      window.removeEventListener('resize', updateListOffset);
    };
  }, [isScrollVisible, isSearchActive]);

  useLayoutEffect(
    () => () => {
      reviewMeasurementCache = {
        queryKey: measurementCacheKey,
        measurements: virtualizer.takeSnapshot(),
      };
    },
    [measurementCacheKey, virtualizer],
  );

  const handleLikeChange = useCallback(
    (reviewId: number, nextIsLiked: boolean) => {
      queryClient.setQueryData<
        InfiniteData<ApiResponse<ReviewListData>, string | undefined>
      >(queryKey, (currentData) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          pages: currentData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((review) => {
                if (
                  review.reviewId !== reviewId ||
                  review.isLikedByMe === nextIsLiked
                ) {
                  return review;
                }

                return {
                  ...review,
                  isLikedByMe: nextIsLiked,
                  likeCount: Math.max(
                    0,
                    review.likeCount + (nextIsLiked ? 1 : -1),
                  ),
                };
              }),
            },
          })),
        };
      });
    },
    [queryClient, queryKey],
  );

  return (
    <section className="pb-20">
      <ExploreSearchBar
        handleSearch={refetch}
        handleAddKeyword={handleAddKeyword}
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        description={`보고싶은 리뷰의 내용, 플레이버태그, 작성자, 위스키이름을\n 추가하여 검색해보세요.`}
      />
      <article className="flex flex-wrap gap-x-1 gap-y-1.5">
        {keywords.map((keyword) => (
          <div key={keyword.value} className="flex-shrink-0 overflow-hidden">
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
        <List.Section>
          <div ref={listRef}>
            <div
              role="list"
              aria-label="리뷰 목록"
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const review = reviews[virtualItem.index];

                return (
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    role="listitem"
                    aria-posinset={virtualItem.index + 1}
                    aria-setsize={reviewCount}
                    data-index={virtualItem.index}
                    className={`absolute left-0 top-0 w-full pb-[30px] ${
                      virtualItem.index === 0
                        ? ''
                        : 'border-t border-stroke-neutral-subtle'
                    }`}
                    style={{
                      transform: `translateY(${virtualItem.start - listOffset}px)`,
                    }}
                  >
                    <ReviewCard
                      content={review}
                      priority={virtualItem.index === 0}
                      onLikeChange={handleLikeChange}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div ref={targetRef} className="h-10" />
        </List.Section>
      </List>
    </section>
  );
};
