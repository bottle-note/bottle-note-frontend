'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

export default function SearchHeader() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateScroll = () => {
    setScrollPosition(window.scrollY || document.documentElement.scrollTop);
  };

  useEffect(() => {
    window.addEventListener('scroll', updateScroll);
  });

  const handleSearch = (value: string) => {
    console.log('Search', value);
  };

  return (
    // FIXME: 전체 높이 사이즈 조절
    <div className="py-[1.3rem] px-5 space-y-4 bg-subCoral pt-[64px]">
      <div
        className={`transition-all duration-500 ease-in-out ${
          scrollPosition > 0 ? 'pt-10' : ''
        }`}
      >
        <SearchBar handleSearch={handleSearch} />
      </div>
    </div>
  );
}
