import { useState, useEffect } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { RateApi } from '@/api/rate/rate.api';

export const useAlcoholDetails = (
  alcoholId: string | number,
  type = 'register',
) => {
  const [alcoholData, setAlcoholData] =
    useState<AlcoholDetailsResponse['alcohols']>();
  const [userRating, setUserRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!alcoholId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const alcoholResult = await AlcoholsApi.getAlcoholDetails(
          alcoholId.toString(),
        );
        setAlcoholData(alcoholResult.data.alcohols);

        if (type === 'register') {
          const ratingResult = await RateApi.getUserRating(
            alcoholId.toString(),
          );
          setUserRating(ratingResult.data.rating);
        }
      } catch (err) {
        console.error('Failed to fetch alcohol details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [alcoholId, type]);

  return { alcoholData, userRating, isLoading };
};
