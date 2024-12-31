'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/Search/SearchBar';
import LogoWhite from 'public/bottle_note_Icon_logo_white.svg';

export default function Header() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateScroll = () => {
    setScrollPosition(window.scrollY || document.documentElement.scrollTop);
  };

  useEffect(() => {
    window.addEventListener('scroll', updateScroll);
  });

  return (
    <div className="py-[1.3rem] px-5 bg-subCoral pt-14">
      <div
        className={`transition-opacity duration-500 ease-in-out flex items-center space-x-1 ${
          scrollPosition > 0 ? 'opacity-0 delay-150' : 'opacity-100'
        }`}
      >
        <Image src={LogoWhite} alt="Logo" />
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${
          scrollPosition > 0 ? 'pt-5' : 'pt-3'
        }`}
      >
        <SearchBar type="Link" />
      </div>
    </div>
  );
}
