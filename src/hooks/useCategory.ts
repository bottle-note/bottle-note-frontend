import { CATEGORY_MENUS } from '@/constants/common';
import { Category } from '@/types/common';
import { useState } from 'react';

export const useCategory = () => {
  const categories = Object.values(CATEGORY_MENUS);
  const [selectedCategory, setSelectedCategory] = useState<Category>('');

  const handleCategory = (
    value: Category,
    callback: (param: Category) => void,
  ) => {
    setSelectedCategory(value);
    callback(value);
  };

  return { categories, selectedCategory, handleCategory };
};
