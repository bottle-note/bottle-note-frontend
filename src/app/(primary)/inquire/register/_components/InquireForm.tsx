'use client';

import { useFormContext } from 'react-hook-form';
import { FormValues } from '@/types/Inquire';

export default function InquireForm() {
  const { register, watch } = useFormContext<FormValues>();

  return (
    <>
      <article className="space-y-[10px]">
        <label
          className="block font-bold text-mainGray text-13 mb-1"
          htmlFor="title"
        >
          문의 제목
        </label>
        <input
          id="title"
          type="text"
          placeholder=""
          className="w-full h-9 bg-sectionWhite rounded-none px-3 text-14 outline-none focus:border focus:border-subCoral"
          {...register('title')}
        />
      </article>

      <article className="space-y-[10px]">
        <label
          className="block font-bold text-mainGray text-13 mb-1"
          htmlFor="contact"
        >
          <span className="font-bold">연락처 </span>
          <span className="font-light">(이메일 혹은 전화번호)</span>
        </label>
        <input
          id="contact"
          type="text"
          placeholder=""
          className="w-full h-9 bg-sectionWhite rounded-none px-3 text-14 outline-none focus:border focus:border-subCoral"
          {...register('contact')}
        />
      </article>

      <article className="space-y-[10px]">
        <label className="block text-13 mb-1 text-mainGray" htmlFor="content">
          <span className="font-bold">문의 내용 </span>
          <span className="font-light">(자세한 내용을 적어주세요)</span>
        </label>
        <div className="relative">
          <textarea
            id="content"
            placeholder="문의 내용을 작성해주세요. (최소 10자)"
            className="w-full h-56 bg-sectionWhite rounded-none px-3 py-3 pb-8 text-14 outline-none focus:border focus:border-subCoral resize-none"
            minLength={10}
            maxLength={1000}
            {...register('content')}
          />
          <div className="absolute bottom-[10px] right-[14px] text-mainGray text-10">
            ({watch('content')?.length} / 1000)
          </div>
        </div>
      </article>
    </>
  );
}
