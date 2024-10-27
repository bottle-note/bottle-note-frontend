'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import RecentSearch from '../../_components/RecentSearch';

interface Props {
  handleSearchCallback: (value: string) => void;
  isWrapper?: boolean;
  placeholder?: string;
}

function SearchContainer({
  handleSearchCallback,
  isWrapper = true,
  placeholder,
}: Props) {
  const { handleScroll } = useBlockScroll();
  const [isOnSearch, setIsOnSearch] = useState(false);
  const SearchHistory = new SearchHistoryService();

  const onSearch = (value: string) => {
    SearchHistory.save(value);

    if (handleSearchCallback) {
      handleSearchCallback(value);
    }

    setIsOnSearch(false);
  };

  useEffect(() => {
    if (isOnSearch) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return handleScroll({ isScroll: false });
    }

    return handleScroll({ isScroll: true });
  }, [isOnSearch]);

  return (
    <>
      {isWrapper ? (
        <div className="px-5 pt-[76px] pb-6 bg-subCoral relative">
          <SearchBar
            handleSearch={onSearch}
            handleFocus={(status) => setIsOnSearch(status)}
            placeholder={placeholder}
          />
        </div>
      ) : (
        <SearchBar
          handleSearch={onSearch}
          handleFocus={(status) => setIsOnSearch(status)}
          placeholder={placeholder}
        />
      )}

      {isOnSearch && (
        <div className="absolute w-full h-full z-10 p-5">
          <RecentSearch handleSearch={onSearch} />
        </div>
      )}
    </>
  );
}

export default SearchContainer;
