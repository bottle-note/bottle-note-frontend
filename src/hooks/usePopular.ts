import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { WeeklyAlcohol } from '@/types/Alcohol';
import { useLayoutEffect, useState } from 'react';

export const usePopular = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [populars, setPopulars] = useState<WeeklyAlcohol[]>([]);

  useLayoutEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await AlcoholsApi.getPopular();

      setPopulars(result);
      setIsLoading(false);
    })();
  }, []);

  return { populars, isLoading };
};
