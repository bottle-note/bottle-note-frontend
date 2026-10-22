import { useState, useEffect } from 'react';
import { RateApi } from '@/api/rate/rate.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useAlcoholDetailQuery } from '@/queries/useAlcoholDetailQuery';

export const useAlcoholDetails = (
  alcoholId: string | number,
  type = 'register',
) => {
  const alcoholIdString = alcoholId ? alcoholId.toString() : '';
  const { isLoading: isAuthLoading, user } = useAuthSession();
  const { data, isLoading: isAlcoholLoading } = useAlcoholDetailQuery({
    alcoholId: alcoholIdString,
    viewerId: user?.userId ?? null,
    enabled: !isAuthLoading,
  });
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    if (!alcoholIdString || type !== 'register') return;

    RateApi.getUserRating(alcoholIdString)
      .then((ratingResult) => setUserRating(ratingResult.data.rating))
      .catch((err) => console.error('Failed to fetch user rating:', err));
  }, [alcoholIdString, type]);

  return {
    alcoholData: data?.alcohols,
    userRating,
    isLoading: isAlcoholLoading,
  };
};
