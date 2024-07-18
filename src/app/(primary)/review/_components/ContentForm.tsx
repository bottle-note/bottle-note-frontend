import React from 'react';
import Toggle from '@/app/(primary)/_components/Toggle';
import { useFormContext } from 'react-hook-form';

export default function ContentForm() {
  const { register, setValue, watch } = useFormContext();
  return (
    <article>
      <textarea
        placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 1,000자)"
        className="text-10 w-full h-48"
        maxLength={1000}
        {...register('review')}
      />
      <div className="text-10 text-mainGray flex justify-between items-center">
        <Toggle
          onChange={(value) => {
            const status = value ? 'PUBLIC' : 'PRIVATE';
            setValue('status', status);
          }}
        />
        <div>({watch('review')?.length}/1000)</div>
      </div>
    </article>
  );
}
