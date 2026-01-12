'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import SearchBar from '@/components/feature/Search/SearchBar';
import CategorySelector from '@/components/ui/Form/CategorySelector';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { AlcoholAPI } from '@/types/Alcohol';
import { Category, SORT_TYPE, SORT_ORDER } from '@/types/common';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import SelectableAlcoholItem from './SelectableAlcoholItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlcohol: (alcoholId: string) => void;
}

const PAGE_SIZE = 20;

export default function AlcoholSearchBottomSheet({
  isOpen,
  onClose,
  onSelectAlcohol,
}: Props) {
  const [searchResults, setSearchResults] = useState<AlcoholAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const lastKeywordRef = useRef<string>('');

  const {
    currentTab: categorySelectedTab,
    handleTab: handleCategoryTab,
    tabList: categoryTabList,
  } = useTab({
    tabList: [{ id: 'category', name: '카테고리' }],
    scroll: true,
  });

  const fetchAlcohols = useCallback(
    async (keyword?: string, category?: Category) => {
      setIsLoading(true);
      setHasSearched(true);
      setCursor(0);

      try {
        const response = await AlcoholsApi.getList({
          keyword: keyword || undefined,
          category,
          sortType: SORT_TYPE.POPULAR,
          sortOrder: SORT_ORDER.DESC,
          cursor: 0,
          pageSize: PAGE_SIZE,
        });

        setSearchResults(response.data.alcohols);
        setHasNext(response.meta.pageable?.hasNext ?? false);
        setCursor(response.meta.pageable?.currentCursor ?? 0);
      } catch {
        setSearchResults([]);
        setHasNext(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchMore = useCallback(async () => {
    if (isFetchingMore || !hasNext) return;

    setIsFetchingMore(true);

    try {
      const nextCursor = cursor + PAGE_SIZE;
      const response = await AlcoholsApi.getList({
        keyword: lastKeywordRef.current || undefined,
        category: selectedCategory,
        sortType: SORT_TYPE.POPULAR,
        sortOrder: SORT_ORDER.DESC,
        cursor: nextCursor,
        pageSize: PAGE_SIZE,
      });

      setSearchResults((prev) => [...prev, ...response.data.alcohols]);
      setHasNext(response.meta.pageable?.hasNext ?? false);
      setCursor(response.meta.pageable?.currentCursor ?? nextCursor);
    } catch {
      // 에러 시 상태 유지
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasNext, cursor, selectedCategory]);

  const { targetRef } = useInfiniteScroll({
    fetchNextPage: fetchMore,
    options: {
      rootMargin: '300px',
      threshold: 0,
    },
  });

  const handleSearch = useCallback(
    async (keyword: string) => {
      lastKeywordRef.current = keyword;
      await fetchAlcohols(keyword, selectedCategory);
    },
    [selectedCategory, fetchAlcohols],
  );

  // 바텀시트가 열릴 때 초기 데이터 로드
  useEffect(() => {
    if (isOpen && !hasSearched) {
      fetchAlcohols(undefined, undefined);
    }
  }, [isOpen, hasSearched, fetchAlcohols]);

  const handleSelect = (alcoholId: string) => {
    onSelectAlcohol(alcoholId);
    setSearchResults([]);
    setHasSearched(false);
    setHasNext(false);
    setCursor(0);
  };

  const handleCategoryChange = useCallback(
    (category: Category) => {
      setSelectedCategory(category);
      // 카테고리 변경 시 현재 검색어로 재검색
      fetchAlcohols(lastKeywordRef.current || undefined, category);
    },
    [fetchAlcohols],
  );

  const handleClose = () => {
    setSearchResults([]);
    setHasSearched(false);
    setHasNext(false);
    setCursor(0);
    setSelectedCategory(undefined);
    lastKeywordRef.current = '';
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} height={85}>
      <div className="px-5 pt-4 pb-3">
        <SearchBar
          handleSearch={handleSearch}
          placeholder="찾으시는 술이 있으신가요?"
        />
      </div>

      <article className="space-y-4 pb-3">
        <Tab
          variant="bookmark"
          tabList={categoryTabList}
          handleTab={handleCategoryTab}
          currentTab={categorySelectedTab}
        />
        <div className="pl-5">
          <CategorySelector
            handleCategoryCallback={handleCategoryChange}
            selectedCategory={selectedCategory}
          />
        </div>
      </article>

      <div className="flex-1 overflow-y-auto px-5 pb-safe">
        {isLoading ? (
          <div className="space-y-2">
            {['a', 'b', 'c', 'd', 'e'].map((id) => (
              <ListItemSkeleton key={`skeleton-${id}`} />
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            {searchResults.map((item) => (
              <SelectableAlcoholItem
                key={item.alcoholId}
                data={item}
                onSelect={handleSelect}
              />
            ))}
            {isFetchingMore && (
              <div className="space-y-2 py-2">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            )}
            <div ref={targetRef} className="h-1" />
          </div>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full text-mainGray">
            <p className="text-14">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-mainGray">
            <p className="text-14">위스키 이름을 검색해보세요.</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
