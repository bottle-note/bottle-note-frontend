'use client';

import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EnterIcon from 'public/icon/search-subcoral.svg';
import DeleteIcon from 'public//icon/reset-mainGray.svg';

interface Props {
  type?: 'Link' | 'Search';
  handleSearch?: (value: string) => void;
  handleFocus?: (status: boolean) => void;
  placeholder?: string;
  setUpdateSearchText?: Dispatch<
    SetStateAction<((text: string) => void) | null>
  >;
}

const SearchButton = () => (
  <div className="px-2 w-10 absolute top-0 right-1 h-full flex items-center justify-center">
    <Image src={EnterIcon} alt="search button" />
  </div>
);

export default function SearchBar({
  type = 'Search',
  handleSearch,
  handleFocus,
  placeholder = '어떤 술을 찾고 계신가요?',
  setUpdateSearchText,
}: Props) {
  const currSearchKeyword = useSearchParams().get('query');
  const [searchText, setSearchText] = useState<string>(currSearchKeyword ?? '');

  const handleSubmit = () => {
    if (handleSearch) {
      handleSearch(searchText);
    }
    if (handleFocus) handleFocus(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchText('');
    if (handleFocus) handleFocus(true);
  };

  const inputProps = {
    type: 'text',
    className: `w-full bg-white rounded-lg h-10 pl-4 pr-12 outline-none text-mainCoral placeholder-mainCoral text-15 border border-mainCoral${
      type === 'Link' ? ' cursor-pointer' : ''
    }`,
    placeholder,
    'aria-label': '검색어 입력',
  };

  useEffect(() => {
    setSearchText(currSearchKeyword ?? '');
  }, [currSearchKeyword]);

  useEffect(() => {
    if (type === 'Search' && setUpdateSearchText) {
      setUpdateSearchText(() => (newText: string) => {
        setSearchText(newText);
      });
      return () => setUpdateSearchText(null);
    }
  }, [setUpdateSearchText, type]);

  if (type === 'Link') {
    return (
      <div className="relative">
        <Link href="/search" className="relative">
          <input {...inputProps} readOnly />
          <SearchButton />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        {...inputProps}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        onFocus={() => handleFocus?.(true)}
        onBlur={() => handleFocus?.(false)}
      />
      {searchText?.length > 0 && (
        <button
          type="button"
          onMouseDown={handleDelete}
          className="absolute right-11 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
          aria-label="검색어 지우기"
        >
          <Image src={DeleteIcon} alt="delete" />
        </button>
      )}
      <button
        className="px-2 w-10 absolute top-0 right-1 h-full flex items-center justify-center"
        onMouseDown={handleSubmit}
        aria-label="검색"
      >
        <SearchButton />
      </button>
    </div>
  );
}
