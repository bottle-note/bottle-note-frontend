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
import SearchContainer from '@/components/Search/SearchContainer';
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

  const handleSearchCallback = (searchedKeyword: string) => {
    handleFilter('keyword', searchedKeyword);
  };

  const handleCategoryCallback = (selectedCategory: typeof currHistoryType) => {
    handleFilter('tabType', selectedCategory);
  };

  // FIXME: handleTab 과 handleCategoryCallback 통합하여 관리하도록 수정
  useEffect(() => {
    const selected = tabList.find((item) => item.id === historyType);

    handleTab(selected?.id ?? 'all');
    handleCategoryCallback(currHistoryType);
  }, [historyType]);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  const SORT_OPTIONS = [
    { name: '최신순', type: SORT_TYPE.LATEST },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '리뷰순', type: SORT_TYPE.REVIEW },
  ];

  useEffect(() => {
    if (currentTab.id === 'all') return setCurrHistoryType('ALL');
    if (currentTab.id === 'rating') return setCurrHistoryType('RATING');
    if (currentTab.id === 'review') return setCurrHistoryType('REVIEW');
    if (currentTab.id === 'pick') return setCurrHistoryType('PICK');
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

        <SearchContainer
          handleSearchCallback={handleSearchCallback}
          placeholder="찾으시는 술이 있으신가요?"
          styleProps="p-5"
        />

        <section className="pt-5 px-5 space-y-7.5">
          <Tab
            currentTab={currentTab}
            handleTab={handleTab}
            tabList={tabList}
          />

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
              handleOptionCallback={(value) => handleFilter('sortType', value)}
            />
            <List.OptionSelect
              options={REGIONS.map((region) => ({
                type: String(region.regionId),
                name: region.korName,
              }))}
              handleOptionCallback={(value) => handleFilter('regionId', value)}
            />

            {alcoholList &&
              [...alcoholList.map((list) => list.data.myBottleList)]
                .flat()
                .map((item: any) => (
                  <List.Item key={item.alcoholId} data={item} />
                ))}
          </List>
          <div ref={targetRef} />
        </section>
      </main>
    </Suspense>
  );
}
