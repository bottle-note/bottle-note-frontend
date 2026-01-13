'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TastingTagsApi } from '@/api/tasting-tags';
import useModalStore from '@/store/modalStore';

const TAGS_LIMIT = 15;

export default function ContentForm() {
  const { register, watch, setValue } = useFormContext();
  const { handleModalState } = useModalStore();
  const [isExtracting, setIsExtracting] = useState(false);

  const review = watch('review') || '';
  const currentTags = watch('flavor_tags') || [];

  const handleExtractTags = async () => {
    if (!review.trim()) {
      handleModalState({
        isShowModal: true,
        mainText: '리뷰 내용을 먼저 작성해주세요.',
      });
      return;
    }

    setIsExtracting(true);

    try {
      const extractedTags = await TastingTagsApi.extractTags(review);

      // 기존 태그와 병합, 중복 제거, 최대 15개 제한
      const mergedTags = [...new Set([...currentTags, ...extractedTags])].slice(
        0,
        TAGS_LIMIT,
      );

      setValue('flavor_tags', mergedTags);

      if (extractedTags.length === 0) {
        handleModalState({
          isShowModal: true,
          mainText: '추출된 태그가 없습니다.',
        });
      }
    } catch {
      handleModalState({
        isShowModal: true,
        mainText: '태그 추출에 실패했습니다.',
        subText: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <article>
      <textarea
        {...register('review')}
        placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 700자)"
        className="text-16 w-full h-48"
        maxLength={700}
      />
      <div className="flex justify-between items-center mt-1">
        <p className="text-12 text-mainGray">{review.length}/700</p>
        <button
          type="button"
          onClick={handleExtractTags}
          disabled={isExtracting}
          className={`text-15 px-2 py-1 rounded-md border w-24 shrink-0 ${isExtracting ? 'border-brightGray text-bgGray' : 'border-subCoral text-white bg-subCoral'}`}
        >
          {isExtracting ? '추출 중...' : '태그 추출'}
        </button>
      </div>
    </article>
  );
}
