import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type InfiniteData,
  type QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import {
  type VirtualItem,
  useWindowVirtualizer,
} from '@tanstack/react-virtual';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ExploreApi } from '@/api/explore/explore.api';
import { ReviewApi } from '@/api/review/review.api';
import { ExploreReview } from '@/api/explore/types';
import type { ApiResponse } from '@/api/_shared/types';
import List from '@/components/feature/List/List';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import useModalStore from '@/store/modalStore';
import { DEBOUNCE_DELAY } from '@/constants/common';
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

interface PendingReviewLike {
  timer: number | undefined;
  chain: Promise<void>;
  version: number;
  desiredState: boolean;
  serverState: boolean;
  queryKeys: Map<string, QueryKey>;
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
  const { handleModalState } = useModalStore();
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
  const isMountedRef = useRef(true);
  const pendingLikesRef = useRef(new Map<number, PendingReviewLike>());
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
  }, [isScrollVisible, isSearchActive, keywords]);

  useLayoutEffect(
    () => () => {
      reviewMeasurementCache = {
        queryKey: measurementCacheKey,
        measurements: virtualizer.takeSnapshot(),
      };
    },
    [measurementCacheKey, virtualizer],
  );

  const updateReviewLikeCache = useCallback(
    (targetQueryKey: QueryKey, reviewId: number, nextIsLiked: boolean) => {
      queryClient.setQueryData<
        InfiniteData<ApiResponse<ReviewListData>, string | undefined>
      >(targetQueryKey, (currentData) => {
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
    [queryClient],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      pendingLikesRef.current.forEach((pendingLike, reviewId) => {
        if (pendingLike.timer === undefined) return;

        window.clearTimeout(pendingLike.timer);
        pendingLike.queryKeys.forEach((targetQueryKey) => {
          updateReviewLikeCache(
            targetQueryKey,
            reviewId,
            pendingLike.serverState,
          );
        });
      });
    };
  }, [updateReviewLikeCache]);

  const handleLikeChange = useCallback(
    (reviewId: number, nextIsLiked: boolean) => {
      let pendingLike = pendingLikesRef.current.get(reviewId);

      if (!pendingLike) {
        const currentData =
          queryClient.getQueryData<
            InfiniteData<ApiResponse<ReviewListData>, string | undefined>
          >(queryKey);
        const review = currentData?.pages
          .flatMap((page) => page.data.items)
          .find((item) => item.reviewId === reviewId);
        if (!review) return;

        pendingLike = {
          timer: undefined,
          chain: Promise.resolve(),
          version: 0,
          desiredState: review.isLikedByMe,
          serverState: review.isLikedByMe,
          queryKeys: new Map(),
        };
        pendingLikesRef.current.set(reviewId, pendingLike);
      }

      pendingLike.version += 1;
      pendingLike.desiredState = nextIsLiked;
      pendingLike.queryKeys.set(measurementCacheKey, queryKey);
      updateReviewLikeCache(queryKey, reviewId, nextIsLiked);

      if (pendingLike.timer !== undefined) {
        window.clearTimeout(pendingLike.timer);
      }

      const syncVersion = pendingLike.version;
      const requestedState = pendingLike.desiredState;

      pendingLike.timer = window.setTimeout(() => {
        pendingLike.timer = undefined;
        pendingLike.chain = pendingLike.chain.then(async () => {
          if (
            syncVersion !== pendingLike.version ||
            requestedState === pendingLike.serverState
          ) {
            return;
          }

          try {
            await ReviewApi.putLike({
              reviewId: String(reviewId),
              isLiked: requestedState,
            });
            pendingLike.serverState = requestedState;
          } catch (error) {
            console.error('Error updating review like status:', error);

            if (syncVersion !== pendingLike.version) return;

            pendingLike.queryKeys.forEach((targetQueryKey) => {
              updateReviewLikeCache(
                targetQueryKey,
                reviewId,
                pendingLike.serverState,
              );
            });

            if (isMountedRef.current) {
              handleModalState({
                isShowModal: true,
                mainText: '좋아요 업데이트에 실패했습니다. 다시 시도해주세요.',
              });
            }
          }
        });
      }, DEBOUNCE_DELAY);
    },
    [
      handleModalState,
      measurementCacheKey,
      queryClient,
      queryKey,
      updateReviewLikeCache,
    ],
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
