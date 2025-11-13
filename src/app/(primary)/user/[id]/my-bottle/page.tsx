'use client';

import React, { Suspense, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { UserApi } from '@/app/api/UserApi';
import { MyBottleApi } from '@/app/api/MyBottleApi';
import List from '@/components/feature/List/List';
import Tab from '@/components/ui/Navigation/Tab';
import { REGIONS } from '@/constants/common';
import { useTab } from '@/hooks/useTab';
import { RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import SearchContainer from '@/components/feature/Search/SearchContainer';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { useFilter } from '@/hooks/useFilter';
import {
  MyBottleTabType,
  PickMyBottleListResponse,
  RatingMyBottleListResponse,
  ReviewMyBottleListResponse,
} from '@/types/MyBottle';
import { RatingsListItem } from './_components/RatingsListItem';
import { ReviewListItem } from './_components/ReviewListItem';
import { PicksListItem } from './_components/PicksListItem';

interface InitialState {
  keyword: string;
  regionId: RegionId;
  sortType: SORT_TYPE.REVIEW | SORT_TYPE.LATEST | SORT_TYPE.RATING;
  sortOrder: SORT_ORDER;
  tabType: MyBottleTabType;
}

const SORT_OPTIONS = [{ name: '최신순', type: SORT_TYPE.LATEST }];

export default function MyBottle({
  params: { id: userId },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const myBottleType = useSearchParams().get('type') as MyBottleTabType;
  const { currentTab, handleTab, tabList } = useTab<{
    id: MyBottleTabType;
    name: string;
  }>({
    tabList: [
      { id: 'ratings', name: '별점' },
      { id: 'reviews', name: '리뷰' },
      { id: 'picks', name: '찜' },
    ],
  });

  const initialState: InitialState = {
    keyword: '',
    regionId: '',
    sortType: SORT_TYPE.LATEST,
    sortOrder: SORT_ORDER.DESC,
    tabType: currentTab.id,
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<
    | RatingMyBottleListResponse
    | ReviewMyBottleListResponse
    | PickMyBottleListResponse
  >({
    queryKey: ['my-bottle', filterState, currentTab.id],
    queryFn: ({ pageParam }) => {
      const apiMethod = MyBottleApi.getMyBottle(currentTab.id);

      return apiMethod({
        params: {
          ...filterState,
          cursor: pageParam,
          pageSize: 10,
        },
        userId: Number(userId),
      });
    },
  });

  const { data: userInfo } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      const result = await UserApi.getUserInfo({ userId });
      return result;
    },
    enabled: !!alcoholList && !alcoholList[0]?.data.isMyPage,
    staleTime: Infinity,
  });

  const handleSearchCallback = useCallback((searchedKeyword: string) => {
    handleFilter('keyword', searchedKeyword);
  }, []);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  useEffect(() => {
    handleTab(myBottleType);
  }, []);

  const isMyPage = alcoholList?.[0]?.data.isMyPage;
  const nickName = userInfo?.nickName;

  const headerTitle = (() => {
    if (isMyPage) return '마이보틀';
    if (nickName) return `${nickName}의 보틀`;
    return '';
  })();

  const listTitle = (() => {
    if (isMyPage) return `나의 ${currentTab.name}`;
    if (nickName) return `${nickName}님의 ${currentTab.name}`;
    return '';
  })();

  return (
    <Suspense>
      <main>
        <SubHeader>
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
          <SubHeader.Center>{headerTitle}</SubHeader.Center>
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
            isEmpty={
              !isFirstLoading &&
              (!alcoholList || alcoholList[0]?.data.myBottleList.length === 0)
            }
          >
            <List.Title title={listTitle} />
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
                  .map((item) => {
                    if (currentTab.id === 'ratings') {
                      return (
                        <RatingsListItem
                          data={
                            item as RatingMyBottleListResponse['myBottleList'][number]
                          }
                          isMyPage={alcoholList[0].data.isMyPage}
                          key={item.baseMyBottleInfo.alcoholId}
                        />
                      );
                    }

                    if (currentTab.id === 'reviews') {
                      return (
                        <ReviewListItem
                          data={
                            item as ReviewMyBottleListResponse['myBottleList'][number]
                          }
                          key={
                            (
                              item as ReviewMyBottleListResponse['myBottleList'][number]
                            ).reviewId
                          }
                        />
                      );
                    }

                    if (currentTab.id === 'picks') {
                      return (
                        <PicksListItem
                          data={
                            item as PickMyBottleListResponse['myBottleList'][number]
                          }
                          isMyPage={isMyPage}
                          key={
                            (
                              item as PickMyBottleListResponse['myBottleList'][number]
                            ).baseMyBottleInfo.alcoholId
                          }
                        />
                      );
                    }

                    return <></>;
                  })}
            </List.Section>
          </List>
          <div ref={targetRef} />
        </section>
      </main>
    </Suspense>
  );
}
