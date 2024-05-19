'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CATEGORY_MENUS } from '@/constants/common';
import CategoryTitle from './CategoryTitle';

function CategorySelector() {
  const router = useRouter();
  // FIXME: 상수에 공백 없애야 함
  const currentCategory = usePathname().split('/')[2]?.replace('%20', ' ');

  const [categories, setCategories] = useState<
    {
      kor: string;
      eng: string;
    }[]
  >([]);

  useEffect(() => {
    const filterCategory = Object.values(CATEGORY_MENUS).map((category) => ({
      kor: category.kor,
      eng: category.eng,
    }));

    setCategories(filterCategory);
  }, []);

  return (
    <section className="space-y-4">
      <CategoryTitle subTitle="카테고리" />
      <article className="whitespace-nowrap overflow-x-auto flex space-x-1.5">
        {categories.map((category) => {
          return (
            <button
              key={category.eng}
              className={`${currentCategory === category.eng ? 'btn-selected' : 'btn-default'} px-2.5 py-1`}
              onClick={() => router.push(`/search/${category.eng}`)}
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
