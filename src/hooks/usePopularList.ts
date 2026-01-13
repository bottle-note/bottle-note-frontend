import { useEffect, useState } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { Alcohol } from '@/api/alcohol/types';
import { PopularType } from '@/types/Popular';

interface Props {
  type?: PopularType;
}

export const usePopularList = ({ type = 'week' }: Props = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [popular, setPopular] = useState<(Alcohol & { path: string })[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let result: (Alcohol & { path: string })[];
        switch (type) {
          case 'week': {
            const response = await AlcoholsApi.getWeeklyPopular();
            result = response.data.alcohols as (Alcohol & { path: string })[];
            break;
          }
          case 'spring': {
            const response = await AlcoholsApi.getSpringPopular();
            result = response.data as (Alcohol & { path: string })[];
            break;
          }
          case 'recent': {
            const response = await AlcoholsApi.getHistory();
            result = response.data.items as (Alcohol & { path: string })[];
            break;
          }
          default:
            result = [];
        }
        setPopular(result);
      } catch (error) {
        console.error('Failed to fetch popular list:', error);
        setPopular([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [type]);

  return { popularList: popular, isLoading };
};
