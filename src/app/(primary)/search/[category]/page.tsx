'use client';

import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';

export default function Category() {
  return (
    <>
      <CategorySelector />

      <section>
        {/* TODO: 아래 리스트는 매니저 컴포넌트가 필요하다! */}
        <List>
          <List.Manager displayValue="인기순" />
          {MOCK_LIST_ITEM.map((item: any) => (
            <List.Item key={item.whiskyId} data={item} />
          ))}
        </List>
      </section>
    </>
  );
}
