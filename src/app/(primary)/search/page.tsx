import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import ListItem from '@/components/ListItem';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import SearchHeader from '../_components/SearchHeader';

export default function Search() {
  return (
    // FIXME: 검색 화면에 스크롤이 생기면 안될 것 같은데...
    <main className="mb-24 w-full h-full">
      <SearchHeader />
      <section className="p-5 space-y-7">
        <CategorySelector currentValue="전체" />
        {/* TODO: 리스트 컴포넌트 공통컴포넌트화 && 합성 컴포넌트화 */}
        <section>
          <CategoryTitle subTitle="위클리 HOT 5" />
          <section>
            {MOCK_LIST_ITEM.map((item) => (
              <ListItem key={item.whiskyId} data={item} />
            ))}
          </section>
        </section>
      </section>
    </main>
  );
}
