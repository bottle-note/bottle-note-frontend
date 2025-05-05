import React, { useEffect } from 'react';
import { Category } from '@/types/common';
import { useTab } from '@/hooks/useTab';
import { CATEGORY_MENUS } from '@/constants/common';
import { useSearchParams } from 'next/navigation';

interface Props {
  handleCategoryCallback: (value: Category) => void;
}

function CategorySelector({ handleCategoryCallback }: Props) {
  const searchParams = useSearchParams();
  const currCategory = searchParams.get('category') as Category;

  const categoryMenuList = Object.values(CATEGORY_MENUS).map((category) => ({
    id: category.categoryGroup,
    name: category.kor,
  }));
  const {
    currentTab,
    handleTab,
    registerTab,
    tabList: categoryList,
    refs: { scrollContainerRef },
  } = useTab({ tabList: categoryMenuList, scroll: true, align: 'left' });

  const handleCategory = (v: (typeof categoryMenuList)[number]) => {
    handleCategoryCallback(v.id);
    handleTab(v.id);
  };

  useEffect(() => {
    if (currCategory) {
      const selectedCategory = categoryMenuList.find(
        (category) => category.id === currCategory,
      );

      if (selectedCategory) {
        handleTab(selectedCategory.id);
      }
    }
  }, [currCategory]);

  return (
    <article
      className="whitespace-nowrap overflow-x-auto flex space-x-1.5 scrollbar-hide pr-5"
      ref={scrollContainerRef}
    >
      {categoryList.map((category) => {
        return (
          <button
            ref={registerTab(category.id)}
            key={category.id}
            className={`${category.id === currentTab.id ? 'label-selected' : 'label-default'} px-2.5 py-1`}
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
