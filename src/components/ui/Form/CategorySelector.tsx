import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { Category } from '@/types/common';
import { useTab } from '@/hooks/useTab';
import { CATEGORY_MENUS_LIST } from '@/constants/common';

interface Props {
  handleCategoryCallback: (value: Category) => void;
  selectedCategory?: Category; // 제어 모드용 (optional)
}

function CategorySelector({ handleCategoryCallback, selectedCategory }: Props) {
  const searchParams = useSearchParams();

  // 제어 모드 여부 확인
  const isControlled = selectedCategory !== undefined;

  // 제어 모드: selectedCategory prop 사용
  // 비제어 모드: URL params 사용
  const currCategory = isControlled
    ? selectedCategory
    : (searchParams.get('category') as Category);
  const hasCategoryParam = isControlled
    ? !!selectedCategory
    : searchParams.has('category');

  const initialTab = hasCategoryParam
    ? CATEGORY_MENUS_LIST.find((cat) => cat.id === currCategory)
    : undefined;

  const {
    currentTab,
    handleTab,
    registerTab,
    tabList: categoryList,
    refs: { scrollContainerRef },
  } = useTab({
    tabList: CATEGORY_MENUS_LIST,
    scroll: true,
    align: 'left',
    initialTab,
  });

  const handleCategory = (v: (typeof CATEGORY_MENUS_LIST)[number]) => {
    handleCategoryCallback(v.id);
    handleTab(v.id);
  };

  useEffect(() => {
    if (hasCategoryParam && currCategory) {
      const category = CATEGORY_MENUS_LIST.find((cat) => cat.id === currCategory);

      if (category) {
        handleTab(category.id);
      }
    }
  }, [currCategory, hasCategoryParam]);

  return (
    <article
      className="whitespace-nowrap overflow-x-auto flex space-x-1.5 scrollbar-hide pr-5"
      ref={scrollContainerRef}
    >
      {categoryList.map((category) => {
        const isSelected = hasCategoryParam && category.id === currentTab.id;
        return (
          <button
            ref={registerTab(category.id)}
            key={category.id}
            className={clsx(
              'px-2.5 py-1',
              isSelected ? 'label-selected' : 'label-default',
            )}
            onClick={() => handleCategory(category)}
          >
            <span className="text-sm font-light">{category.name}</span>
          </button>
        );
      })}
    </article>
  );
}

export default CategorySelector;
