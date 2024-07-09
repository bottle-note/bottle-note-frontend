'use client';

import SearchBar from '@/components/SearchBar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import RecentSearch from '../../_components/RecentSearch';

function SearchContainer() {
  const paths = usePathname().split('/');
  const [isOnFocus, setIsOnFocus] = useState(false);

  const handleFocus = () => {
    setIsOnFocus(!isOnFocus);
  };

  const handleSearch = (value: string) => {};

  return (
    <>
      <div className="px-5 pt-[76px] pb-6 bg-subCoral relative">
        <SearchBar handleSearch={handleSearch} handleFocus={handleFocus} />
      </div>
      {isOnFocus && (
        <div className="absolute w-full h-full z-10 p-5">
          <RecentSearch />
        </div>
      )}
    </>
  );
}

export default SearchContainer;
