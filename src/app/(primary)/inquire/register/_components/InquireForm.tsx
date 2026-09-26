'use client';

import { useFormContext } from 'react-hook-form';
import { FormValues } from '@/types/Inquire';

export default function InquireForm() {
  const { register, watch } = useFormContext<FormValues>();

  return (
    <>
      <article className="space-y-10">
        <label
          className="block font-bold text-fg-neutral-muted text-13 mb-4"
          htmlFor="title"
        >
          문의 제목
        </label>
        <input
          id="title"
          type="text"
          placeholder=""
          className="w-full h-36 bg-bg-layer-floating rounded-none px-12 text-14 text-fg-neutral outline-none focus:border focus:border-stroke-brand-solid"
          {...register('title')}
        />
      </article>

      <article className="space-y-10">
        <label
          className="block font-bold text-fg-neutral-muted text-13 mb-4"
          htmlFor="contact"
        >
          <span className="font-bold">연락처 </span>
          <span className="font-light">(이메일 혹은 전화번호)</span>
        </label>
        <input
          id="contact"
          type="text"
          placeholder=""
          className="w-full h-36 bg-bg-layer-floating rounded-none px-12 text-14 text-fg-neutral outline-none focus:border focus:border-stroke-brand-solid"
          {...register('contact')}
        />
      </article>

      <article className="space-y-10">
        <label
          className="block text-13 mb-4 text-fg-neutral-muted"
          htmlFor="content"
        >
          <span className="font-bold">문의 내용 </span>
          <span className="font-light">(자세한 내용을 적어주세요)</span>
        </label>
        <div className="relative">
          <textarea
            id="content"
            placeholder="문의 내용을 작성해주세요. (최소 10자)"
            className="w-full h-224 bg-bg-layer-floating rounded-none px-12 py-12 pb-32 text-14 text-fg-neutral outline-none focus:border focus:border-stroke-brand-solid resize-none"
            minLength={10}
            maxLength={1000}
            {...register('content')}
          />
          <div className="absolute bottom-10 right-14 text-fg-neutral-muted text-10">
            ({watch('content')?.length} / 1000)
          </div>
        </div>
      </article>
    </>
  );
}
