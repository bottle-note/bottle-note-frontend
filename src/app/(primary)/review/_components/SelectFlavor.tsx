'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';

export default function SelectFlavor() {
  const router = useRouter();
  const DATA = [
    '완전 건조된 건자두',
    '민트',
    '오크',
    '완전 건조된 건자두',
    '민트',
    '오크',
    '달콤한 데이지',
    '청포도',
  ];
  return (
    <div className="fixed inset-0 z-50 top-0 bg-white w-full h-full">
      <div className="relative">
        <SubHeader bgColor="bg-bgGray">
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center textColor="text-subCoral">
            Title test
            {/* {alcoholKorName && truncStr(alcoholKorName, 12)} */}
          </SubHeader.Center>
        </SubHeader>
        <div className="px-5 space-y-5 mt-10">
          <div className="flex items-center space-x-1">
            <Image
              src="/icon/success-subcoral.svg"
              alt="placeIcon"
              width={26}
              height={26}
            />
            <p className="text-sm text-mainDarkGray">FLAVOR TAG 선택</p>
          </div>
          <p className="text-sm text-mainDarkGray">
            내가 느낀 플레이버 태그를 입력 하세요.{' '}
            <span className="text-mainGray font-normal">(최대 15개)</span>
          </p>
          <div>
            <div className="flex items-center border-b border-mainGray/30 py-2 space-x-1">
              <input
                type="text"
                className="text-xxs text-mainGray w-full"
                placeholder="예) 반건조 된 건자두"
                maxLength={12}
              />
              <button
                className={`text-xxs py-[0.13rem] px-2 rounded border  w-16 ${DATA.length !== 10 ? 'border-subCoral text-subCoral' : 'border-[#BFBFBF] text-[#BFBFBF]'}`}
                disabled={DATA.length === 10}
              >
                태그 등록
              </button>
            </div>
            <p className="text-xxs text-mainGray mt-5">
              선택된 플레이버 태그 (0개)
            </p>
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {DATA.map((tag, index) => (
                  <div
                    key={tag + index}
                    className="overflow-hidden flex-shrink-0"
                  >
                    <CreateLabel name={tag} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CreateLabel = ({ name }: { name: string }) => {
  return (
    <div className="inline-block text-xs bg-subCoral text-white px-2 py-1 rounded ">
      <div className="flex items-center justify-center space-x-1">
        <p>{name}</p>
        <Image
          className="mr-1"
          src="/icon/close-white.svg"
          width={12}
          height={12}
          alt="close"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};
