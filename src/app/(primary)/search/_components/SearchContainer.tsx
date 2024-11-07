'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import RecentSearch from '../../_components/RecentSearch';

interface Props {
  handleSearchCallback: (value: string) => void;
  placeholder?: string;
  styleProps?: string;
}

function SearchContainer({
  handleSearchCallback,
  placeholder,
  styleProps,
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
      <div className={styleProps}>
        <SearchBar
          handleSearch={onSearch}
          handleFocus={(status) => setIsOnSearch(status)}
          placeholder={placeholder}
        />
      </div>

      {isOnSearch && (
        <div className="absolute w-full h-full z-10 p-5">
          <RecentSearch handleSearch={onSearch} />
        </div>
      )}
    </>
  );
}

export default SearchContainer;
