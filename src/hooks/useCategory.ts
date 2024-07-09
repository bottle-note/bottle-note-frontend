import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { CategoryApi } from '@/types/Alcohol';
import { useLayoutEffect, useState } from 'react';

export const useCategory = () => {
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleCategory = (value: string, callback: (param: string) => void) => {
    setSelectedCategory(value);
    callback(value);
  };

  useLayoutEffect(() => {
    (async () => {
      const cat = await AlcoholsApi.getCategory();
      setCategories(cat);
    })();
  }, []);

  return { categories, selectedCategory, handleCategory };
};
