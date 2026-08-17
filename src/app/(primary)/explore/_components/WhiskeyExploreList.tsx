import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreAlcohol } from '@/api/explore/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/feature/List/List';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import WhiskeyListItem from './WhiskeyListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useWhiskeyExploreSearch } from '../_hooks/useWhiskeyExploreSearch';

interface WhiskeyExplorerListProps {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
}

const ESTIMATED_WHISKEY_ITEM_HEIGHT = 177;
const WHISKEY_LIST_OVERSCAN = 5;

export const WhiskeyExplorerList = ({
  isSearchActive,
  onSearchActiveChange,
}: WhiskeyExplorerListProps) => {
  const router = useRouter();
  const { isScrollVisible } = useNavLayout();
  const { isLoggedIn, user } = useAuthSession();
  const { handleModalState, handleCloseModal, handleLoginState } =
    useModalStore();
  const { inputKeyword, debouncedKeyword, isTyping, setInputKeyword } =
    useWhiskeyExploreSearch();
  const { regionIds, category } = useExploreFilters();

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
      debouncedKeyword,
      user?.userId ?? null,
    ],
    queryFn: ({ pageParam, signal }) => {
      return ExploreApi.getAlcohols({
        keywords: debouncedKeyword ? [debouncedKeyword] : [],
        regionIds: regionIds.length > 0 ? regionIds : undefined,
        category: category || undefined,
        sortType: 'POPULAR',
        sortOrder: 'DESC',
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
  const hasReachedEnd =
    !isFirstLoading &&
    !isFetching &&
    !isPlaceholderData &&
    !error &&
    alcoholList !== undefined &&
    hasNextPage === false;
  const showInquireButton = isEmpty || (hasReachedEnd && alcoholCount > 0);
  const listRef = useRef<HTMLDivElement>(null);
  const [listOffset, setListOffset] = useState(0);
  const getItemKey = useCallback(
    (index: number) => alcohols[index]?.alcoholId ?? index,
    [alcohols],
  );
  const virtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: alcoholCount,
    estimateSize: () => ESTIMATED_WHISKEY_ITEM_HEIGHT,
    getItemKey,
    overscan: WHISKEY_LIST_OVERSCAN,
    scrollMargin: listOffset,
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
        isFilter
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
                const alcohol = alcohols[virtualItem.index];

                return (
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    role="listitem"
                    aria-posinset={virtualItem.index + 1}
                    aria-setsize={alcoholCount}
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
      <div ref={targetRef} />
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
