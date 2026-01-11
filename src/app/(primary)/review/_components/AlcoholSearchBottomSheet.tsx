'use client';

import React, { useState, useCallback } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import SearchBar from '@/components/feature/Search/SearchBar';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { AlcoholAPI } from '@/types/Alcohol';
import { SORT_TYPE, SORT_ORDER } from '@/types/common';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import SelectableAlcoholItem from './SelectableAlcoholItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlcohol: (alcoholId: string) => void;
}

export default function AlcoholSearchBottomSheet({
  isOpen,
  onClose,
  onSelectAlcohol,
}: Props) {
  const [searchResults, setSearchResults] = useState<AlcoholAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await AlcoholsApi.getList({
        keyword,
        sortType: SORT_TYPE.POPULAR,
        sortOrder: SORT_ORDER.DESC,
        cursor: 0,
        pageSize: 20,
      });

      setSearchResults(response.data.alcohols);
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelect = (alcoholId: string) => {
    onSelectAlcohol(alcoholId);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleClose = () => {
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} height={85}>
      <div className="px-5 pt-4 pb-6">
        <SearchBar
          handleSearch={handleSearch}
          placeholder="찾으시는 술이 있으신가요?"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-safe">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <ListItemSkeleton key={`skeleton-${i}`} />
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
