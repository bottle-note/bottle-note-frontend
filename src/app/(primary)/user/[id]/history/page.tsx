'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import List from '@/components/List/List';
import Tab from '@/components/Tab';
import { REGIONS } from '@/constants/common';
import { HISTORY_TYPES } from '@/constants/user';
import { usePopularList } from '@/hooks/usePopularList';
import { useTab } from '@/hooks/useTab';
import { SORT_TYPE } from '@/types/common';

export default function UserHistory() {
  const router = useRouter();
  const historyType = useSearchParams().get('type');
  const { currentTab, handleTab, tabList } = useTab({ tabList: HISTORY_TYPES });
  // FIXME: 실제 히스토리 API 연동하여 변경
  const { popularList } = usePopularList();
  const [currHistoryType, setCurrHistoryType] = useState('');

  useEffect(() => {
    const selected = tabList.find((item) => item.id === historyType);

    handleTab(selected?.id ?? 'all');
  }, [historyType]);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  const SORT_OPTIONS = [
    { name: '인기도순', type: SORT_TYPE.POPULAR },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '찜하기순', type: SORT_TYPE.PICK },
    { name: '댓글순', type: SORT_TYPE.REVIEW },
  ];

  // FIXME: 타입 가드 추가
  useEffect(() => {
    if (currentTab.id === 'all') return setCurrHistoryType('나의 활동');
    if (currentTab.id === 'rating') return setCurrHistoryType('나의 별점');
    if (currentTab.id === 'review') return setCurrHistoryType('나의 리뷰');
    if (currentTab.id === 'pick') return setCurrHistoryType('나의 찜');
  }, [currentTab]);

  return (
    <main>
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
          마이페이지
        </SubHeader.Center>
      </SubHeader>

      <section className="pt-10 px-5 space-y-7.5">
        <Tab currentTab={currentTab} handleTab={handleTab} />

        {/* TODO: 실제 데이터로 변동 */}
        <List emptyViewText={`아직 활동한\n보틀이 없어요!`}>
          <List.Title title={currHistoryType} />
          <List.Total total={popularList.length} />
          <List.OptionSelect
            options={SORT_OPTIONS}
            handleOptionCallback={(value) => console.log(value)}
          />
          <List.OptionSelect
            options={REGIONS.map((region) => ({
              type: String(region.regionId),
              name: region.korName,
            }))}
            handleOptionCallback={(value) => console.log(value)}
          />

          {popularList.map((item: any) => (
            <List.Item key={item.alcoholId} data={item} />
          ))}
        </List>
      </section>
    </main>
  );
}
