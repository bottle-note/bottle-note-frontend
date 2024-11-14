import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORY_MENUS } from '@/constants/common';
import { Category } from '@/types/common';

export const useCategory = () => {
  const categories = Object.values(CATEGORY_MENUS);
  const searchParams = useSearchParams();
  const currCategory = searchParams.get('category') as Category;
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    currCategory ?? '',
  );

  const handleCategory = (
    value: Category,
    callback: (param: Category) => void,
  ) => {
    setSelectedCategory(value);
    callback(value);
  };

  return { categories, selectedCategory, handleCategory };
};
