'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CircleHelp, CircleX } from 'lucide-react';
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
    <div className="flex gap-1 text-13 text-fg-neutral-muted">
      <HoverTouchBox
        id="flavor-tooltip"
        tooltipContent={
          <div className="absolute left-5 z-10 flex items-center space-x-1 rounded-md border border-stroke-brand-solid bg-bg-layer-floating p-2">
            <Image
              src="/icon/questionmark-subcoral.svg"
              alt="questionMarkIcon"
              width={15}
              height={15}
            />
            <p className="text-11 text-fg-brand">
              위스키에서 느껴지는 느낌을 태그로 등록해보세요!
            </p>
          </div>
        }
      >
        <CircleHelp
          aria-label="플레이버 태그 도움말"
          className="h-[15px] w-[15px]"
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
          <div className="flex h-11 items-center border-b border-stroke-brand-solid">
            <input
              type="text"
              className="w-full bg-transparent text-15 text-fg-neutral placeholder:text-fg-placeholder focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
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
              type="button"
              className={`w-24 shrink-0 text-15 ${watchTags?.length < TAGS_LIMIT ? 'label-selected' : 'label-disabled'}`}
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
                  <div className="label-default inline-block text-13">
                    <div className="flex items-center justify-center space-x-1">
                      <p>{tag}</p>
                      <button
                        type="button"
                        aria-label={`${tag} 태그 삭제`}
                        onClick={() => handleDeleteTag(tag)}
                      >
                        <CircleX className="h-[15px] w-[15px] text-fg-neutral-muted" />
                      </button>
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
