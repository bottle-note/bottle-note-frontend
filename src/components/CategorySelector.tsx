'use client';

import React, { useEffect, useRef } from 'react';
import { useCategory } from '@/hooks/useCategory';
import { Category } from '@/types/common';
import CategoryTitle from './CategoryTitle';

interface Props {
  handleCategoryCallback: (value: Category) => void;
}

function CategorySelector({ handleCategoryCallback }: Props) {
  const { categories, handleCategory, selectedCategory } = useCategory();
  const selectedRef = useRef<HTMLButtonElement>(null);

  const onSelectCategory = (value: Category) => {
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
              key={category.eng}
              className={`${selectedCategory === category.categoryGroup ? 'label-selected' : 'label-default'} px-2.5 py-1`}
              onClick={() => onSelectCategory(category.categoryGroup)}
              ref={
                category.categoryGroup === selectedCategory ? selectedRef : null
              }
            >
              <span className="text-sm font-light">{category.kor}</span>
            </button>
          );
        })}
      </article>
    </section>
  );
}

export default CategorySelector;
