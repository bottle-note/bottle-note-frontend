'use client';

import React, { useState, useCallback } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import SearchBar from '@/components/feature/Search/SearchBar';
import CategorySelector from '@/components/ui/Form/CategorySelector';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { Category } from '@/types/common';
import { SORT_TYPE, SORT_ORDER } from '@/api/_shared/types';
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
  const [keyword, setKeyword] = useState('');
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

  const { data, isLoading, isFetching, targetRef } = usePaginatedQuery({
    queryKey: ['alcoholSearch', keyword, selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      return AlcoholsApi.getList({
        keyword: keyword || undefined,
        category: selectedCategory,
        sortType: SORT_TYPE.POPULAR,
        sortOrder: SORT_ORDER.DESC,
        cursor: pageParam,
        pageSize: PAGE_SIZE,
      });
    },
    pageSize: PAGE_SIZE,
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const searchResults = data?.flatMap((page) => page.data.alcohols) ?? [];
  const isFetchingMore = isFetching && !isLoading;
  const hasSearched = data !== undefined;

  const handleSearch = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  const handleSelect = (alcoholId: string) => {
    onSelectAlcohol(alcoholId);
  };

  const handleCategoryChange = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  const handleClose = () => {
    setKeyword('');
    setSelectedCategory(undefined);
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
