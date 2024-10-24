'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import List from '@/components/List/List';
import Tab from '@/components/Tab';
import { REGIONS } from '@/constants/common';
import { HISTORY_TYPES } from '@/constants/user';
import { useTab } from '@/hooks/useTab';
import { RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import SearchContainer from '@/app/(primary)/search/_components/SearchContainer';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { AlcoholAPI } from '@/types/Alcohol';
import { UserApi } from '@/app/api/UserApi';
import { useFilter } from '@/hooks/useFilter';

interface InitialState {
  keyword: string;
  regionId: RegionId;
  sortType: SORT_TYPE.REVIEW | SORT_TYPE.LATEST | SORT_TYPE.RATING;
  sortOrder: SORT_ORDER;
  tabType: 'ALL' | 'REVIEW' | 'PICK' | 'RATING';
}

export default function MyBottle({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const historyType = useSearchParams().get('type');
  const { currentTab, handleTab, tabList } = useTab({ tabList: HISTORY_TYPES });
  const [currHistoryType, setCurrHistoryType] = useState<
    'ALL' | 'REVIEW' | 'PICK' | 'RATING'
  >('ALL');

  const initialState: InitialState = {
    keyword: '',
    regionId: '',
    sortType: SORT_TYPE.LATEST,
    sortOrder: SORT_ORDER.DESC,
    tabType: currHistoryType,
  };
  const { state: filterState, handleFilter } = useFilter(initialState);

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    isMyPage: boolean;
    totalCount: number;
    myBottleList: (AlcoholAPI & { hasReviewByMe: boolean })[];
  }>({
    queryKey: ['my-bottle', filterState],
    queryFn: ({ pageParam }) => {
      return UserApi.myBottle({
        params: {
          ...filterState,
          ...{
            cursor: pageParam,
            pageSize: 10,
          },
        },
        userId: Number(userId),
      });
    },
  });

  useEffect(() => {
    const selected = tabList.find((item) => item.id === historyType);

    handleTab(selected?.id ?? 'all');
  }, [historyType]);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  useEffect(() => {
    console.log(alcoholList);
  }, [alcoholList]);

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
    <Suspense>
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
            마이보틀
          </SubHeader.Center>
        </SubHeader>

        <section className="pt-5 px-5 space-y-7.5">
          <SearchContainer
            handleSearchCallback={() => {}}
            isWrapper={false}
            placeholder="찾으시는 술이 있으신가요?"
          />
          <Tab currentTab={currentTab} handleTab={handleTab} />

          <List
            emptyViewText={`아직 활동한\n보틀이 없어요!`}
            isListFirstLoading={isFirstLoading}
            isScrollLoading={isFetching}
          >
            <List.Title title={currHistoryType} />
            <List.Total
              total={alcoholList ? alcoholList[0].data.totalCount : 0}
            />
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

            {alcoholList &&
              [...alcoholList.map((list) => list.data.myBottleList)]
                .flat()
                .map((item: any) => (
                  <List.Item key={item.alcoholId} data={item} />
                ))}
          </List>
        </section>
      </main>
    </Suspense>
  );
}
