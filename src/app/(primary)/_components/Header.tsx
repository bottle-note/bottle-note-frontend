'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/Search/SearchBar';
import LogoWhite from 'public/bottle_note_Icon_logo_white.svg';

export default function Header() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      setScrollPosition(window.scrollY || document.documentElement.scrollTop);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, [updateScroll]);

  return (
    <header className="sticky top-0 z-50">
      {' '}
      {/* fixed -> sticky로 변경 */}
      <div
        className={`transition-all duration-300 ease-in-out bg-subCoral px-5 ${
          scrollPosition > 0 ? 'py-3' : 'py-[1.3rem] pt-14'
        }`}
      >
        <div
          className={`transition-all duration-300 ease-in-out flex items-center space-x-1 overflow-hidden ${
            scrollPosition > 0 ? 'h-0 opacity-0' : 'h-auto opacity-100 mb-3'
          }`}
        >
          <Image src={LogoWhite} alt="Logo" priority />
        </div>
        <SearchBar type="Link" />
      </div>
    </header>
  );
}
