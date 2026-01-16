import { useEffect, useState } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import {
  HomeFeaturedType,
  HomeFeaturedAlcoholItem,
} from '@/types/HomeFeatured';

interface Props {
  type?: HomeFeaturedType;
}

/**
 * @deprecated 이 훅은 더 이상 사용하지 않습니다.
 * 대신 @/queries/useHomeFeaturedQuery를 사용하세요.
 *
 * TanStack Query를 사용하는 새 훅은 캐싱, 에러 처리, 재시도 등의
 * 기능을 제공합니다.
 */
export const useHomeFeatured = ({ type = 'week' }: Props = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [featured, setFeatured] = useState<HomeFeaturedAlcoholItem[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let result: HomeFeaturedAlcoholItem[];
        switch (type) {
          case 'week': {
            const response = await AlcoholsApi.getWeeklyPopular();
            result = response.data.alcohols as HomeFeaturedAlcoholItem[];
            break;
          }
          case 'view-week': {
            const response = await AlcoholsApi.getWeeklyViewPopular(5);
            result = response.data.alcohols as HomeFeaturedAlcoholItem[];
            break;
          }
          case 'spring': {
            const response = await AlcoholsApi.getSpringPopular();
            result = response.data as HomeFeaturedAlcoholItem[];
            break;
          }
          case 'recent': {
            const response = await AlcoholsApi.getHistory();
            result = response.data.items as HomeFeaturedAlcoholItem[];
            break;
          }
          default:
            result = [];
        }
        setFeatured(result);
      } catch (error) {
        console.error('Failed to fetch home featured list:', error);
        setFeatured([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [type]);

  return { featuredList: featured, isLoading };
};
