'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

function validateText(text: string) {
  const regex = /[\d]|[^a-zA-Z가-힣]/;

  if (regex.test(text)) {
    return false;
  }
  return true;
}

export default function SelectFlavor({ tags, setTags }: Props) {
  const [value, setValue] = useState<string>('');

  const handleAddTag = () => {
    if (value.length === 0) {
      alert('추가하고 싶은 태그를 작성해주세요:)');
    } else if (tags.includes(value)) {
      alert('이미 동일한 태그가 있습니다.');
    } else if (!validateText(value)) {
      alert('태그에 숫자와 특수문자는 추가할 수 없습니다.');
    } else {
      const newTags = [...tags, value];
      setTags(newTags);
      setValue('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    const saveTags = tags.filter((tagName) => tag !== tagName);
    setTags(saveTags);
  };

  return (
    <div className="px-5 space-y-5 mt-10">
      <div className="flex items-center space-x-1">
        <Image
          src="/icon/success-subcoral.svg"
          alt="placeIcon"
          width={26}
          height={26}
        />
        <p className="text-13 text-mainDarkGray">FLAVOR TAG 선택</p>
      </div>
      <p className="text-13 text-mainDarkGray">
        내가 느낀 플레이버 태그를 입력 하세요.{' '}
        <span className="text-mainGray font-normal">(최대 10개)</span>
      </p>
      <div>
        <div className="flex items-center border-b border-mainGray/30 py-2 space-x-1">
          <input
            type="text"
            className="text-10 text-mainGray w-full"
            placeholder="예) 반건조 된 건자두"
            value={value}
            maxLength={12}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
          />
          <button
            className={`text-10 py-[0.13rem] px-2 rounded border  w-16 ${tags.length !== 10 ? 'border-subCoral text-subCoral' : 'border-[#BFBFBF] text-[#BFBFBF]'}`}
            disabled={tags.length === 10}
            onClick={handleAddTag}
          >
            태그 등록
          </button>
        </div>
        <p className="text-10 text-mainGray mt-5">
          선택된 플레이버 태그 ({tags.length}개)
        </p>
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <div key={tag + index} className="overflow-hidden flex-shrink-0">
                <div className="inline-block text-13 bg-subCoral text-white px-2 py-1 rounded ">
                  <div className="flex items-center justify-center space-x-1">
                    <p>{tag}</p>
                    <span onClick={() => handleDeleteTag(tag)}>
                      <Image
                        className="mr-1"
                        src="/icon/close-white.svg"
                        width={12}
                        height={12}
                        alt="delete"
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
