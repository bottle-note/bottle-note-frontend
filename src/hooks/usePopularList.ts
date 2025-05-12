import { useEffect, useState } from 'react';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { AlcoholAPI } from '@/types/Alcohol';

type PopularType = 'week' | 'spring' | 'recent';

interface Props {
  type?: PopularType;
}

export const usePopularList = ({ type = 'week' }: Props = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [popular, setPopular] = useState<(AlcoholAPI & { path: string })[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let result: (AlcoholAPI & { path: string })[];
        switch (type) {
          case 'week':
            result = await AlcoholsApi.getWeeklyPopular();
            break;
          case 'spring':
            result = await AlcoholsApi.getSpringPopular();
            break;
          case 'recent':
            result = await AlcoholsApi.getHistory();
            break;
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
