import React from 'react';
import { useFormContext } from 'react-hook-form';
import AlcoholRatingInput from '@/components/domain/alcohol/AlcoholRatingInput';

export default function RatingForm() {
  const { setValue, watch } = useFormContext();

  const handleRateChange = (selectedRate: number) => {
    setValue('rating', selectedRate);
  };

  return (
    <article className="grid place-items-center space-y-2 pb-3">
      <p className="text-13 text-fg-neutral-muted">
        이 술에 대한 평가를 남겨보세요.
      </p>
      <AlcoholRatingInput value={watch('rating')} onChange={handleRateChange} />
    </article>
  );
}
