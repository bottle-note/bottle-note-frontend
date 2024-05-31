'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';
import { Alcohol } from '@/types/Alcohol';

export default function Rating() {
  const router = useRouter();
  const [populars, setPopulars] = useState<Alcohol[]>([]);
  const [currentCategory, setCurrentCategory] = useState('All');
  const handleCategory = (value: string) => {
    if (value !== currentCategory) router.push(`/rating?category=${value}`);
    setCurrentCategory(value);
  };

  // TODO: 공통 훅으로 빼기
  useEffect(() => {
    (async () => {
      const result = await fetch('/api/alcohols?popular');
      const data: Alcohol[] = await result.json();

      setPopulars(data);
    })();
  }, []);

  const [filterOptions, setFilterOptions] = useState<
    { id: number; value: string }[] | null
  >(null);

  const SORT_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];

  useEffect(() => {
    (async () => {
      const result = await fetch('/api/alcohols?region');
      const regions = await result.json();

      setFilterOptions(regions);
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

          {populars.map((item: any) => (
            <List.Rating key={item.alcoholId} data={item} />
          ))}
        </List>
      </section>
    </>
  );
}
