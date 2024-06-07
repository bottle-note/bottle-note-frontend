'use client';

import EmptyView from '@/app/(primary)/_components/EmptyView';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import List from '@/components/List/List';
import Tab from '@/components/Tab';
import { HISTORY_TYPES } from '@/constants/user';
import { useTab } from '@/hooks/useTab';
import { Alcohol } from '@/types/Alcohol';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function UserHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyType = searchParams.get('type');
  const { currentTab, handleTab, tabList } = useTab({ tabList: HISTORY_TYPES });
  const [populars, setPopulars] = useState<Alcohol[]>([]);
  const [filterOptions, setFilterOptions] = useState<
    { id: number; value: string }[] | null
  >(null);

  useEffect(() => {
    const selected = tabList.find((item) => item.id === historyType);

    handleTab(selected?.id ?? 'all');
  }, [historyType]);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  const SORT_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];

  useEffect(() => {
    (async () => {
      console.log('호출되나용?');
      const result = await AlcoholsApi.getRegion();
      setFilterOptions(result);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await AlcoholsApi.getPopular();
      setPopulars(result);
    })();
  }, []);

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

        <List>
          {filterOptions && (
            <List.Manager
              total={populars.length}
              sortOptions={SORT_OPTIONS}
              hanldeSortOption={(value) => console.log(value)}
              filterOptions={filterOptions}
            />
          )}

          {populars.map((item: any) => (
            <List.Item key={item.alcoholId} data={item} />
          ))}

          {!populars.length && <EmptyView />}
        </List>
      </section>
    </main>
  );
}
