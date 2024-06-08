'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';
import { AlcoholsApi } from '@/app/api/AlcholsApi';

export default function Category() {
  const router = useRouter();
  const currentCategory = usePathname().split('/')[2].replace('%20', ' ');
  const handleCategory = (value: string) => {
    router.push(`/search/${value}`);
  };

  const [filterOptions, setFilterOptions] = useState<
    { id: number; value: string }[] | null
  >(null);

  const SORT_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];

  useEffect(() => {
    (async () => {
      const result = await AlcoholsApi.getRegion();

      setFilterOptions(result);
    })();
  }, []);

  return (
    <>
      <CategorySelector
        selectedCategory={currentCategory}
        handleCategory={handleCategory}
      />

      <section>
        <List>
          {filterOptions && (
            <List.Manager
              total={52}
              sortOptions={SORT_OPTIONS}
              hanldeSortOption={(value) => console.log(value)}
              filterOptions={filterOptions}
            />
          )}
          {MOCK_LIST_ITEM.map((item: any) => (
            <List.Item key={item.alcoholId} data={item} />
          ))}
        </List>
      </section>
    </>
  );
}
