import { useState, useEffect } from 'react';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { RateApi } from '@/app/api/RateApi';

export const useAlcoholDetails = (
  alcoholId: string | number,
  type = 'register',
) => {
  const [alcoholData, setAlcoholData] = useState<AlcoholDetails>();
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
        setAlcoholData(alcoholResult.alcohols);

        if (type === 'register') {
          const ratingResult = await RateApi.getUserRating(
            alcoholId.toString(),
          );
          setUserRating(ratingResult.rating);
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
