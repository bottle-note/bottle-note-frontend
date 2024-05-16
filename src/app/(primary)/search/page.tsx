/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import React, { useState } from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import SearchBar from '@/components/SearchBar';
import SearchList from './_components/SearchList';
import RecentSearch from '../_components/RecentSearch';

export default function Search() {
  const [isOnFocus, setIsOnFocus] = useState(false); // FIXME: 이걸 state로 관리하는게 맞을지 고민

  const handleSearch = (value: string) => {
    console.log(value);
    // TODO: api call here
  };

  return (
    // FIXME: 검색 화면에 스크롤이 생기면 안될 것 같은데...
    <main className="mb-24 w-full h-full">
      <div
        className="px-5 pt-[76px] pb-6 bg-subCoral"
        onClick={() => setIsOnFocus(true)}
      >
        <SearchBar handleSearch={handleSearch} />
      </div>

      <section className="p-5 space-y-7">
        {isOnFocus ? (
          <RecentSearch />
        ) : (
          <>
            <CategorySelector currentValue="전체" />
            <section>
              <CategoryTitle subTitle="위클리 HOT 5" />
              <SearchList data={MOCK_LIST_ITEM} />
            </section>
          </>
        )}
      </section>
    </main>
  );
}
