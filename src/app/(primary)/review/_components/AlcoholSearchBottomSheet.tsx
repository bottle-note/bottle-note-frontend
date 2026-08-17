'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import SearchBar from '@/components/feature/Search/SearchBar';
import CategorySelector from '@/components/ui/Form/CategorySelector';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { ExploreApi } from '@/api/explore/explore.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { Category } from '@/types/common';
import { SORT_TYPE, SORT_ORDER } from '@/api/_shared/types';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import SelectableAlcoholItem from './SelectableAlcoholItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlcohol: (alcoholId: string) => void;
  onRequestAlcohol: (keyword: string) => void;
  initialKeyword?: string;
}

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 300;

const normalizeKeyword = (keyword: string) =>
  keyword.trim().replace(/\s+/g, ' ');

export default function AlcoholSearchBottomSheet({
  isOpen,
  onClose,
  onSelectAlcohol,
  onRequestAlcohol,
  initialKeyword = '',
}: Props) {
  const { user } = useAuthSession();
  const [inputKeyword, setInputKeyword] = useState(initialKeyword);
  const normalizedKeyword = useMemo(
    () => normalizeKeyword(inputKeyword),
    [inputKeyword],
  );
  const [debouncedKeyword, setDebouncedKeyword] = useState(() =>
    normalizeKeyword(initialKeyword),
  );
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);

  const {
    currentTab: categorySelectedTab,
    handleTab: handleCategoryTab,
    tabList: categoryTabList,
  } = useTab({
    tabList: [{ id: 'category', name: '카테고리' }],
    scroll: true,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(normalizedKeyword);
    }, DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [normalizedKeyword]);

  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    refetch,
    targetRef,
  } = usePaginatedQuery({
    queryKey: [
      'alcoholSearch',
      user?.userId ?? null,
      debouncedKeyword,
      selectedCategory,
    ],
    queryFn: async ({ pageParam, signal }) => {
      return ExploreApi.getAlcohols({
        keywords: debouncedKeyword ? [debouncedKeyword] : [],
        category: selectedCategory,
        sortType: SORT_TYPE.POPULAR,
        sortOrder: SORT_ORDER.DESC,
        cursor: pageParam,
        size: PAGE_SIZE,
        signal,
      });
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const searchResults = data?.flatMap((page) => page.data.items) ?? [];
  const isTyping = normalizedKeyword !== debouncedKeyword;
  const isSearching = isTyping || (isFetching && !isFetchingNextPage);
  const showEmptySearch =
    !!debouncedKeyword && !isTyping && !error && searchResults.length === 0;

  const handleSearch = useCallback((newKeyword: string) => {
    const normalized = normalizeKeyword(newKeyword);
    setInputKeyword(newKeyword);
    setDebouncedKeyword(normalized);
  }, []);

  const handleSelect = (alcoholId: string) => {
    onSelectAlcohol(alcoholId);
  };

  const handleCategoryChange = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  const handleClose = () => {
    setInputKeyword('');
    setDebouncedKeyword('');
    setSelectedCategory(undefined);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} height={85}>
      <div className="px-5 pt-4 pb-3">
        <SearchBar
          handleSearch={handleSearch}
          value={inputKeyword}
          initialValue={initialKeyword}
          onValueChange={setInputKeyword}
          placeholder="찾으시는 술이 있으신가요?"
        />
      </div>

      <article className="space-y-4 pb-3">
        <Tab
          variant="bookmark"
          surface="floating"
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
        {isLoading || isSearching ? (
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
            {isFetchingNextPage && (
              <div className="space-y-2 py-2">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            )}
            <div ref={targetRef} className="h-1" />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-fg-neutral-muted">
            <p className="text-14">검색 중 문제가 발생했습니다.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg bg-bg-brand-primary-solid px-5 py-2 text-13 text-fg-brand-contrast"
            >
              다시 시도
            </button>
          </div>
        ) : showEmptySearch ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-fg-neutral-muted">
            <p className="text-14">검색 결과가 없습니다.</p>
            <button
              type="button"
              onClick={() => onRequestAlcohol(debouncedKeyword)}
              className="rounded-lg border border-stroke-brand-solid px-5 py-2 text-13 text-fg-brand"
            >
              위스키 등록 요청하기
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-fg-neutral-muted">
            <p className="text-14">등록된 위스키가 없습니다.</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
