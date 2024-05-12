'use client';

import React, { useEffect, useState } from 'react';
import { CATEGORY_MENUS } from '@/constants/common';
import CategoryTitle from './CategoryTitle';

interface Props {
  currentValue: string;
  // TODO: 핸들러를 어떻게 하면 넘길 수 있을까? 어떻게 하면 쿼리 파라미터를 상태값으로 관리할 수 있을까? 서버 컴포넌트의 구조를 잘 생각해보자...
  //   handler: (selectedValue: string) => void;
}

function CategorySelector({ currentValue }: Props) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const filterCategory: string[] = Object.values(CATEGORY_MENUS).map(
      (category) => category.kor,
    );

    setCategories(filterCategory);
  }, []);

  return (
    <section className="space-y-4">
      <CategoryTitle subTitle="카테고리" />
      <article className="whitespace-nowrap overflow-x-auto flex space-x-1.5">
        {categories.map((value) => {
          return (
            <button
              key={value}
              className={`${currentValue === value ? 'btn-selected' : 'btn-default'} px-2.5 py-1`}
              onClick={() => null}
            >
              <span className="text-sm font-light">{value}</span>
            </button>
          );
        })}
      </article>
    </section>
  );
}

export default CategorySelector;
