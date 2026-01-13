'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import useModalStore from '@/store/modalStore';
import HoverTouchBox from '@/components/ui/Interactive/HoverTouchBox';
import { TAGS_LIMIT, validateTagText } from '@/constants/review';
import OptionsContainer from '../OptionsContainer';

export default function TagsForm() {
  const { handleModalState } = useModalStore();
  const { setValue, watch } = useFormContext();
  const [tagValue, setTagValue] = useState<string>('');

  const watchTags = watch('flavor_tags');

  const handleAddTag = () => {
    if (tagValue.length === 0) {
      handleModalState({
        isShowModal: true,
        mainText: '추가하고 싶은 태그를 작성해주세요:)',
      });
    } else if (watchTags && watchTags.includes(tagValue)) {
      handleModalState({
        isShowModal: true,
        mainText: '이미 동일한 태그가 있습니다.',
      });
    } else if (!validateTagText(tagValue)) {
      handleModalState({
        isShowModal: true,
        mainText: '태그에 숫자와 특수문자는 추가할 수 없습니다.',
      });
    } else {
      const newTags = [...watchTags, tagValue];
      setTagValue('');
      setValue('flavor_tags', newTags);
    }
  };

  const handleDeleteTag = (tag: string) => {
    const saveTags = watchTags.filter((tagName: string) => tag !== tagName);
    setValue('flavor_tags', saveTags);
  };

  const ExtraButtons = (
    <div className="flex gap-1 text-13 text-mainDarkGray ">
      <HoverTouchBox
        id="flavor-tooltip"
        tooltipContent={
          <div className="absolute z-10 left-5 flex items-center bg-white p-2 border border-subCoral rounded-md space-x-1">
            <Image
              src="/icon/questionmark-subcoral.svg"
              alt="questionMarkIcon"
              width={15}
              height={15}
            />
            <p className="text-11 text-subCoral">
              위스키에서 느껴지는 느낌을 태그로 등록해보세요!
            </p>
          </div>
        }
      >
        <Image
          src="/icon/questionmark-gray.svg"
          alt="questionMarkIcon"
          width={15}
          height={15}
        />
      </HoverTouchBox>
      <p>
        {watchTags && watchTags.length !== 0 && `총 ${watchTags.length}개 입력`}
      </p>
    </div>
  );

  return (
    <>
      <OptionsContainer
        iconSrc="/icon/success-subcoral.svg"
        iconAlt="tagIcon"
        forceOpen
        title="플레이버 태그 남기실래요?"
        subTitle="(선택)"
        titleSideArea={{
          component: ExtraButtons,
        }}
      >
        <article className="ml-7 mt-[6px]">
          <div className="h-11 flex items-center border-b border-subCoral">
            <input
              type="text"
              className="text-15 text-mainDarkGray w-full"
              placeholder="예) 반건조 된 건자두"
              value={tagValue}
              maxLength={12}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTagValue(e.target.value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && watchTags?.length < TAGS_LIMIT) {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              className={`text-15 px-2 py-1 rounded-md border border-solid w-24 shrink-0 ${watchTags?.length < TAGS_LIMIT ? 'border-subCoral text-white bg-subCoral' : 'border-brightGray text-bgGray'}`}
              disabled={watchTags?.length === TAGS_LIMIT}
              onClick={handleAddTag}
            >
              태그 등록
            </button>
          </div>
          {watchTags && watchTags.length !== 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {watchTags.map((tag: string) => (
                <div key={tag} className="overflow-hidden flex-shrink-0">
                  <div className="inline-block text-13 bg-white text-subCoral border border-solid border-subCoral px-2 py-1 rounded-md">
                    <div className="flex items-center justify-center space-x-1">
                      <p>{tag}</p>
                      <span
                        onClick={() => handleDeleteTag(tag)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleDeleteTag(tag);
                          }
                        }}
                      >
                        <Image
                          className="mr-1"
                          src="/icon/reset-mainGray.svg"
                          alt="deleteIcon"
                          width={15}
                          height={15}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </OptionsContainer>
    </>
  );
}
