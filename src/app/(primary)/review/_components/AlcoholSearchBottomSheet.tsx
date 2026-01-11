'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackDrop from '@/components/ui/Modal/BackDrop';
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

  const modalVariants = {
    initial: { y: '100%' },
    animate: { y: 0, transition: { type: 'tween', duration: 0.3 } },
    exit: { y: '100%', transition: { type: 'tween', duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <BackDrop isShow={isOpen} onBackdropClick={handleClose}>
          <motion.section
            className="z-50 w-full bg-white fixed bottom-0 h-[85vh] rounded-t-2xl flex flex-col"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4">
              <SearchBar
                handleSearch={handleSearch}
                placeholder="위스키 이름을 검색하세요"
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
          </motion.section>
        </BackDrop>
      )}
    </AnimatePresence>
  );
}
