'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import SearchContainer from '@/components/Search/SearchContainer';
import TimeLineItem from '@/app/(primary)/_components/TimeLineItem';
import FilterSideModal from './_components/filter/FilterSideModal';
import DescendingIcon from 'public/icon/descending-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';

import { HISTORY_MOCK_LIST_ITEM } from '../../../../mock/history';

export default function History() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const totalCount = HISTORY_MOCK_LIST_ITEM.length;

  const handleSearchCallback = () => {};

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <NavLayout>
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
          나의 히스토리
        </SubHeader.Center>
      </SubHeader>
      <main>
        <SearchContainer
          placeholder="위스키 이름 검색"
          handleSearchCallback={handleSearchCallback}
          styleProps="p-5"
          showRecentSearch={false}
        />
        <section className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-mainGray shrink-0">{`총 ${totalCount}개`}</span>
            <div className="flex items-center">
              <Image src={DescendingIcon} alt="내림차순" />
              <Image
                src={FilterIcon}
                alt="필터메뉴"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
          <div className="border-t border-mainGray/30 my-[0.65rem]" />
          <article className="relative">
            <div className="text-10 text-mainGray bg-bgGray rounded-md p-2 ml-3 relative z-10">
              2025년 1월까지 기록된 회원닉네임님의 활동여정이에요!
            </div>
            <div className="absolute left-[2.55rem] top-6 bottom-0 w-px border-l border-dashed border-subCoral z-0" />
            <div className="relative z-10 pb-3 mt-5">
              <TimeLineItem isStart date="2024-01-19T14:35:12" type="BOTTLE" />
            </div>
          </article>
        </section>
      </main>
      <FilterSideModal isOpen={isOpen} onClose={handleClose} />
    </NavLayout>
  );
}
