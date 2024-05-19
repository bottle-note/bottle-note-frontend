/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import SearchList from './_components/SearchList';

export default function Search() {
  return (
    <>
      <CategorySelector />
      <section>
        <CategoryTitle subTitle="위클리 HOT 5" />
        <SearchList data={MOCK_LIST_ITEM} />
      </section>
    </>
  );
}
