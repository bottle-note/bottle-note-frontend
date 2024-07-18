import React from 'react';
import StarRating from '@/components/StarRaiting';
import { useFormContext } from 'react-hook-form';

export default function RatingForm() {
  const { setValue, watch } = useFormContext();

  const handleRate = (selectedRate: number) => {
    setValue('rating', selectedRate);
  };
  return (
    <article className="grid place-items-center space-y-2 pb-3">
      <p className="text-10 text-mainDarkGray">
        이 술에 대한 평가를 남겨보세요.
      </p>
      <div>
        <StarRating size={40} rate={watch('rating')} handleRate={handleRate} />
      </div>
    </article>
  );
}
