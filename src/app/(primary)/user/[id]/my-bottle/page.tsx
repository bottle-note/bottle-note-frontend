'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import List from '@/components/List/List';
import Tab from '@/components/Tab';
import { REGIONS } from '@/constants/common';
import { useTab } from '@/hooks/useTab';
import { RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import SearchContainer from '@/components/Search/SearchContainer';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { useFilter } from '@/hooks/useFilter';
import { MyBottleTabType, RatingMyBottleListResponse } from '@/types/MyBottle';
import { MyBottleApi } from '@/app/api/MyBottleApi';
import { RatingsListItem } from './_components/RatingsListItem';

interface InitialState {
  keyword: string;
  regionId: RegionId;
  sortType: SORT_TYPE.REVIEW | SORT_TYPE.LATEST | SORT_TYPE.RATING;
  sortOrder: SORT_ORDER;
  tabType: MyBottleTabType;
}

export default function MyBottle({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const historyType = useSearchParams().get('type');
  const { currentTab, handleTab, tabList } = useTab({
    tabList: [
      { id: 'rating', name: '별점' },
      { id: 'review', name: '리뷰' },
      { id: 'pick', name: '찜' },
    ],
  });
  const [currHistoryType, setCurrHistoryType] =
    useState<InitialState['tabType']>('ratings');

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
  } = usePaginatedQuery<RatingMyBottleListResponse>({
    queryKey: ['my-bottle', filterState],
    queryFn: ({ pageParam }) => {
      return MyBottleApi.getRatings({
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
    if (currentTab.id === 'rating') return setCurrHistoryType('ratings');
    if (currentTab.id === 'review') return setCurrHistoryType('reviews');
    if (currentTab.id === 'pick') return setCurrHistoryType('picks');
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
            <List.Title title={`나의 ${currentTab.name}`} />
            <List.Total
              total={alcoholList ? alcoholList[0].data.totalCount : 0}
            />
            <List.SortOrderSwitch
              type={filterState.sortOrder}
              handleSortOrder={(value) => handleFilter('sortOrder', value)}
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

            <List.Section>
              {alcoholList &&
                [...alcoholList.map((list) => list.data.myBottleList)]
                  .flat()
                  .map((item) => (
                    <RatingsListItem
                      data={item}
                      key={item.baseMyBottleInfo.alcoholId}
                    />
                  ))}
            </List.Section>
          </List>
          <div ref={targetRef} />
        </section>
      </main>
    </Suspense>
  );
}
