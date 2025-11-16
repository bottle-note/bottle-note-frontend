import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function ContentForm() {
  const { register, watch } = useFormContext();
  const review = watch('review') || '';

  return (
    <article>
      <textarea
        {...register('review')}
        placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 700자)"
        className="text-16 w-full h-48"
        maxLength={700}
      />
      <p className="text-right text-12 text-mainGray mt-1">
        {review.length}/700
      </p>
    </article>
  );
}
