'use client';

import React, { useEffect, Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { useSearchInput } from '@/hooks/useSearchInput';
import EnterIcon from 'public/icon/search-subcoral.svg';
import DeleteIcon from 'public/icon/reset-mainGray.svg';

interface Props {
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
  handleSearch,
  handleFocus,
  placeholder = '어떤 술을 찾고 계신가요?',
  setUpdateSearchText,
}: Props) {
  const {
    searchText,
    inputRef,
    handleChange,
    handleSubmit,
    handleClear,
    handleFocusChange,
    handleKeyDown,
    handleSetText,
  } = useSearchInput({
    onSearch: handleSearch,
    onFocusChange: handleFocus,
    syncWithUrlParams: true,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClear();
  };

  const inputProps = {
    type: 'text',
    className:
      'w-full bg-white rounded-lg h-10 pl-4 pr-12 outline-none text-mainDarkGray placeholder-mainCoral text-15 border border-mainCoral',
    placeholder,
    'aria-label': '검색어 입력',
  };

  useEffect(() => {
    if (setUpdateSearchText) {
      setUpdateSearchText(() => (newText: string) => {
        handleSetText(newText);
      });
      return () => setUpdateSearchText(null);
    }
  }, [setUpdateSearchText, handleSetText]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        {...inputProps}
        value={searchText}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => handleFocusChange(true)}
        onBlur={() => handleFocusChange(false)}
      />
      {searchText?.length > 0 && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
          aria-label="검색어 지우기"
        >
          <Image src={DeleteIcon} alt="delete" />
        </button>
      )}
      <button
        className="px-2 w-10 absolute top-0 right-1 h-full flex items-center justify-center"
        onClick={handleSubmit}
        aria-label="검색"
      >
        <SearchButton />
      </button>
    </div>
  );
}
