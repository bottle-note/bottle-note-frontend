'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import List from '@/components/List/List';
import { Alcohol } from '@/types/Alcohol';

export default function Search() {
  const router = useRouter();
  const [populars, setPopulars] = useState<Alcohol[]>([]);
  const [currentCategory, setCurrentCategory] = useState('All');
  const handleCategory = (value: string) => {
    if (value !== currentCategory) router.push(`/search/${value}`);
    setCurrentCategory(value);
  };

  useEffect(() => {
    (async () => {
      const result = await fetch('/api/alcohols?popular');
      const data: Alcohol[] = await result.json();

      setPopulars(data);
    })();
  }, []);

  return (
    <>
      <CategorySelector
        selectedCategory={currentCategory}
        handleCategory={handleCategory}
      />

      <section>
        <CategoryTitle subTitle="위클리 HOT 5" />
        <List>
          {populars.map((item: any) => (
            <List.Item key={item.alcoholId} data={item} />
          ))}
        </List>
      </section>
    </>
  );
}
