import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreAlcohol } from '@/api/explore/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/feature/List/List';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import WhiskeyListItem from './WhiskeyListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import { GuestExploreGate } from './GuestExploreGate';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useExploreSearch } from '../_hooks/useExploreSearch';
import { useExploreSort } from '../_hooks/useExploreSort';
import { WHISKEY_EXPLORE_TAB_ID } from '../_constants/exploreTabs';

interface WhiskeyExplorerListProps {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
}

const ESTIMATED_WHISKEY_ITEM_HEIGHT = 177;
const WHISKEY_LIST_OVERSCAN = 5;
const GUEST_PREVIEW_ITEM_COUNT = 3;

export const WhiskeyExplorerList = ({
  isSearchActive,
  onSearchActiveChange,
}: WhiskeyExplorerListProps) => {
  const router = useRouter();
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuthSession();
  const { handleModalState, handleCloseModal, handleLoginState } =
    useModalStore();
  const { inputKeyword, debouncedKeyword, isTyping, setInputKeyword } =
    useExploreSearch({ tabId: WHISKEY_EXPLORE_TAB_ID });
  const { sortPresets, selectedSort, selectSort } = useExploreSort({
    tabId: WHISKEY_EXPLORE_TAB_ID,
  });
  const { regionIds, category, ratingPreset } = useExploreFilters();

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    hasNextPage,
    targetRef,
    error,
  } = usePaginatedQuery<{
    items: ExploreAlcohol[];
  }>({
    queryKey: [
      'explore.alcohols',
      category || 'all',
      regionIds.join(',') || 'all',
      ratingPreset?.id ?? 'all',
      debouncedKeyword,
      selectedSort.sortType,
      selectedSort.sortOrder,
      user?.userId ?? null,
    ],
    queryFn: ({ pageParam, signal }) => {
      return ExploreApi.getAlcohols({
        keyword: debouncedKeyword || undefined,
        regionIds: regionIds.length > 0 ? regionIds : undefined,
        category: category || undefined,
        sortType: selectedSort.sortType,
        sortOrder: selectedSort.sortOrder,
        ratingFrom: ratingPreset?.ratingFrom,
        ratingTo: ratingPreset?.ratingTo,
        cursor: pageParam,
        size: 10,
        signal,
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  const isSearching = isFetching && !isFetchingNextPage;
  const isEmpty =
    !error &&
    !isTyping &&
    !isSearching &&
    !isPlaceholderData &&
    (!alcoholList || alcoholList[0]?.data.items.length === 0);

  const alcohols = useMemo(
    () => alcoholList?.flatMap((listData) => listData.data.items.flat()) ?? [],
    [alcoholList],
  );
  const alcoholCount = alcohols.length;
  const shouldGateGuestList =
    !isAuthLoading &&
    !isLoggedIn &&
    (alcoholCount > GUEST_PREVIEW_ITEM_COUNT || hasNextPage === true);
  const visibleAlcohols = useMemo(
    () =>
      shouldGateGuestList
        ? alcohols.slice(0, GUEST_PREVIEW_ITEM_COUNT)
        : alcohols,
    [alcohols, shouldGateGuestList],
  );
  const visibleAlcoholCount = visibleAlcohols.length;
  const hasReachedEnd =
    !isFirstLoading &&
    !isFetching &&
    !isPlaceholderData &&
    !error &&
    alcoholList !== undefined &&
    hasNextPage === false;
  const showInquireButton =
    isEmpty || (!shouldGateGuestList && hasReachedEnd && alcoholCount > 0);
  const listRef = useRef<HTMLDivElement>(null);
  const [listOffset, setListOffset] = useState(0);
  const getItemKey = useCallback(
    (index: number) => visibleAlcohols[index]?.alcoholId ?? index,
    [visibleAlcohols],
  );
  const virtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: visibleAlcoholCount,
    estimateSize: () => ESTIMATED_WHISKEY_ITEM_HEIGHT,
    getItemKey,
    overscan: WHISKEY_LIST_OVERSCAN,
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
    window.addEventListener('resize', updateListOffset);

    return () => {
      window.removeEventListener('resize', updateListOffset);
    };
  }, []);

  const handleClickInquire = () => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: '위스키 추가 요청을 하겠습니까?',
      subText: '문의글을 작성하여 위스키를 요청할까요?',
      handleConfirm: () => {
        if (!isLoggedIn) {
          handleCloseModal();
          handleLoginState(true, ROUTES.INQUIRE.REGISTER);
          return;
        }
        handleCloseModal();
        router.push(ROUTES.INQUIRE.REGISTER);
      },
    });
  };

  return (
    <section>
      <ExploreSearchBar
        mode="realtime"
        initialValue={inputKeyword}
        onValueChange={setInputKeyword}
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        filterTarget="whiskey"
        sortPresets={sortPresets}
        selectedSortId={selectedSort.id}
        onSelectSort={selectSort}
      />
      <div className="border-b border-stroke-neutral-subtle" />

      <List
        emptyViewText="조건에 맞는 위스키가 없어요."
        isListFirstLoading={isFirstLoading}
        isError={!!error}
        isScrollLoading={isFetchingNextPage}
        isEmpty={isEmpty}
      >
        <List.Section>
          <div ref={listRef}>
            <div
              role="list"
              aria-label="위스키 목록"
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const alcohol = visibleAlcohols[virtualItem.index];

                return (
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    role="listitem"
                    aria-posinset={virtualItem.index + 1}
                    aria-setsize={visibleAlcoholCount}
                    data-index={virtualItem.index}
                    className={`absolute left-0 top-0 w-full ${
                      virtualItem.index === 0
                        ? ''
                        : 'border-t border-stroke-neutral-subtle'
                    }`}
                    style={{
                      transform: `translateY(${virtualItem.start - listOffset}px)`,
                    }}
                  >
                    <WhiskeyListItem
                      content={alcohol}
                      priority={virtualItem.index < 4}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </List.Section>
      </List>
      {isLoggedIn && <div ref={targetRef} />}
      {shouldGateGuestList && (
        <GuestExploreGate
          key={JSON.stringify([
            category,
            regionIds,
            ratingPreset?.id,
            debouncedKeyword,
            selectedSort.id,
          ])}
          title="더 많은 위스키가 궁금하신가요?"
          description="로그인하고 나에게 맞는 위스키를 더 찾아보세요."
        />
      )}
      {showInquireButton && (
        <div className="pt-7 pb-20">
          <PrimaryLinkButton
            data={{
              engName: 'NO RESULTS',
              korName: '혹시 찾는 술이 없으신가요?',
              linkSrc: ROUTES.INQUIRE.REGISTER,
              icon: true,
              handleBeforeRouteChange: (event) => {
                event.preventDefault();
                handleClickInquire();
              },
            }}
          />
        </div>
      )}
    </section>
  );
};
