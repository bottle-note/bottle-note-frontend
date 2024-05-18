import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import SearchList from '../_components/SearchList';

export default function Category() {
  return (
    <>
      <CategorySelector />

      <section>
        {/* TODO: 아래 리스트는 매니저 컴포넌트가 필요하다! */}
        <SearchList data={MOCK_LIST_ITEM} />
      </section>
    </>
  );
}
