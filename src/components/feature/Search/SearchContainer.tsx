'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/feature/Search/SearchBar';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { useBlockScroll } from '@/hooks/useBlockScroll';
import RecentSearch from './RecentSearch';

interface Props {
  handleSearchCallback: (value: string) => void;
  placeholder?: string;
  styleProps?: string;
  showRecentSearch?: boolean;
}

function SearchContainer({
  handleSearchCallback,
  placeholder,
  styleProps,
  showRecentSearch = true,
}: Props) {
  const { handleScroll } = useBlockScroll();
  const [isOnSearch, setIsOnSearch] = useState(false);
  const SearchHistory = new SearchHistoryService();
  const [updateSearchText, setUpdateSearchText] = useState<
    ((text: string) => void) | null
  >(null);

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      handleSearchCallback('');
      if (updateSearchText) {
        updateSearchText('');
      }
      setIsOnSearch(false);
      return;
    }

    SearchHistory.save(value);

    if (handleSearchCallback) {
      handleSearchCallback(value);
    }

    if (updateSearchText) {
      updateSearchText(value);
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
          setUpdateSearchText={setUpdateSearchText}
        />
      </div>

      {isOnSearch && showRecentSearch && (
        <div className="w-full fixed-container bottom-0 top-[115px] z-40 bg-white p-3 overflow-y-auto">
          <RecentSearch handleSearch={onSearch} />
        </div>
      )}
    </>
  );
}

export default SearchContainer;
