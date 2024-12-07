'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';

export default function Header() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updateScroll = () => {
    setScrollPosition(window.scrollY || document.documentElement.scrollTop);
  };

  useEffect(() => {
    window.addEventListener('scroll', updateScroll);
  });

  return (
    <div className="py-[1.3rem] px-5 space-y-4 bg-subCoral pt-12">
      <div
        className={`transition-opacity duration-500 ease-in-out flex items-center space-x-1 ${
          scrollPosition > 0 ? 'opacity-0 delay-150' : 'opacity-100'
        }`}
      >
        <Image
          src="/icon/logo-white.svg"
          width={16}
          height={26}
          alt="bottle-note-logo"
        />
        <p className="text-20 text-white">Bottle Note</p>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${
          scrollPosition > 0 ? 'pt-5' : ''
        }`}
      >
        <SearchBar type="Link" />
      </div>
    </div>
  );
}
