import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function ContentForm() {
  const { register } = useFormContext();

  return (
    <article>
      <textarea
        {...register('review')}
        placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 1,000자)"
        className="text-16 w-full h-48"
        maxLength={1000}
      />
    </article>
  );
}
