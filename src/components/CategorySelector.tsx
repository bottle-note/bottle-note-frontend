'use client';

import React, { useEffect, useRef } from 'react';
import CategoryTitle from './CategoryTitle';
import { useCategory } from '@/hooks/useCategory';

interface Props {
  handleCategoryCallback: (value: string) => void;
}

function CategorySelector({ handleCategoryCallback }: Props) {
  const { categories, handleCategory, selectedCategory } = useCategory();
  const selectedRef = useRef<HTMLButtonElement>(null);

  const onSelectCategory = (value: string) => {
    handleCategory(value, handleCategoryCallback);
  };

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [selectedCategory]);

  return (
    <section className="space-y-4">
      <CategoryTitle subTitle="카테고리" />
      <article className="whitespace-nowrap overflow-x-auto flex space-x-1.5">
        {categories.map((category) => {
          return (
            <button
              key={category.engCategory}
              className={`${selectedCategory === category.engCategory ? 'label-selected' : 'label-default'} px-2.5 py-1`}
              onClick={() => onSelectCategory(category.engCategory)}
              ref={
                category.engCategory === selectedCategory ? selectedRef : null
              }
            >
              <span className="text-sm font-light">{category.korCategory}</span>
            </button>
          );
        })}
      </article>
    </section>
  );
}

export default CategorySelector;
