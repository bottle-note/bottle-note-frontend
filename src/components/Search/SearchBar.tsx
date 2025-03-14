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

export default function SearchBar({
  type = 'Search',
  handleSearch,
  handleFocus,
  placeholder,
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

  const handleOnFocus = () => {
    if (handleFocus) handleFocus(true);
  };

  const handleOnBlur = () => {
    if (handleFocus) handleFocus(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchText('');
    if (handleFocus) handleFocus(true);
  };

  useEffect(() => {
    setSearchText(currSearchKeyword ?? '');
  }, [currSearchKeyword]);

  useEffect(() => {
    if (type === 'Search' && setUpdateSearchText) {
      setUpdateSearchText(() => (newText: string) => {
        if (searchText === '') {
          setSearchText(newText);
        }
      });

      return () => setUpdateSearchText(null);
    }
  }, [setUpdateSearchText, searchText, type]);

  return (
    <div className="relative">
      {type === 'Link' ? (
        <Link href="/search" className="relative">
          <div className="w-full flex items-center bg-white rounded-lg h-10 pl-4 pr-12 hover:pointer">
            <p className="absolute t-0 text-mainCoral text-15 font-medium">
              {placeholder || '찾으시는 술이 있으신가요?'}
            </p>
            <div className="w-6 absolute right-3 hover:pointer">
              <Image
                src="/icon/search-subcoral.svg"
                width={50}
                height={50}
                alt="search button"
              />
            </div>
          </div>
        </Link>
      ) : (
        <>
          <input
            type="text"
            className="w-full bg-white rounded-lg h-10 pl-4 pr-12 outline-none text-mainCoral placeholder-mainCoral text-15 border border-mainCoral"
            placeholder={placeholder || '어떤 술을 찾고 계신가요?'}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
          />
          {searchText?.length > 0 && (
            <button
              type="button"
              onMouseDown={handleDelete}
              className="absolute right-11 top-1/2 transform -translate-y-1/2"
            >
              <Image src={DeleteIcon} alt="delete" />
            </button>
          )}
          <button
            className="px-2 w-10 absolute top-0 right-1 h-full"
            onMouseDown={handleSubmit}
          >
            <Image src={EnterIcon} alt="search button" />
          </button>
        </>
      )}
    </div>
  );
}
