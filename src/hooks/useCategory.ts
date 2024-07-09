import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { CategoryApi } from '@/types/Alcohol';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';

export const useCategory = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleCategory = (value: string, callback: (param: string) => void) => {
    if (value !== selectedCategory) router.push(`/rating?category=${value}`);

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
