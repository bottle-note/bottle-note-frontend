import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { Alcohol } from '@/types/Alcohol';
import { useLayoutEffect, useState } from 'react';

export const usePopular = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [populars, setPopulars] = useState<Alcohol[]>([]);

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
