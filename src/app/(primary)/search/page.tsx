import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import SearchList from './_components/SearchList';
import SearchHeader from '../_components/SearchHeader';

export default function Search() {
  // TODO: api call here

  return (
    // FIXME: 검색 화면에 스크롤이 생기면 안될 것 같은데...
    <main className="mb-24 w-full h-full">
      <SearchHeader />
      <section className="p-5 space-y-7">
        <CategorySelector currentValue="전체" />

        <section>
          <CategoryTitle subTitle="위클리 HOT 5" />
          <SearchList data={MOCK_LIST_ITEM} />
        </section>
      </section>
    </main>
  );
}
