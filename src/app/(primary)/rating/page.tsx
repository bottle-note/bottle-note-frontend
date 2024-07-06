'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import EmptyView from '../_components/EmptyView';
import Loading from '@/components/Loading';
import NavLayout from '../_components/NavLayout';
import LinkButton from '@/components/LinkButton';
import { RateApi } from '@/app/api/RateApi';
import { Category, RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useFilter } from '@/hooks/useFilter';
import { RateAPI } from '@/types/Rate';

interface InitialState {
  keyword: string;
  category: Category | '';
  regionId: RegionId;
  sortType: SORT_TYPE.RANDOM;
  sortOrder: SORT_ORDER.DESC;
}

export default function Rating() {
  const router = useRouter();

  const initialState: InitialState = {
    keyword: '',
    category: '',
    regionId: '',
    sortType: SORT_TYPE.RANDOM,
    sortOrder: SORT_ORDER.DESC,
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

  const {
    data: ratingList,
    isLoading: isFirstLoading,
    hasNextPage,
    targetRef,
  } = usePaginatedQuery<{
    ratings: RateAPI[];
  }>({
    queryKey: ['rating', filterState],
    queryFn: ({ pageParam }) => {
      return RateApi.getList({
        ...filterState,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
  });

  // TODO: useCatogory 로 공통화
  const [currentCategory, setCurrentCategory] = useState('All');
  const handleCategory = (value: string) => {
    if (value !== currentCategory) router.push(`/rating?category=${value}`);
    setCurrentCategory(value);
    handleFilter('category', value);
  };

  // TODO: useFilterOptions 로 공통화
  const [filterOptions, setFilterOptions] = useState<
    { id: number; value: string }[] | null
  >(null);

  useEffect(() => {
    (async () => {
      const result = await AlcoholsApi.getRegion();

      setFilterOptions(result);
    })();
  }, []);

  // TODO: useSortOptions 로 공통화
  const SORT_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];

  return (
    <NavLayout>
      <main className="flex flex-col gap-7">
        <CategorySelector
          selectedCategory={currentCategory}
          handleCategory={handleCategory}
        />

        <section>
          <List>
            {filterOptions && (
              <List.Manager
                total={52}
                sortOptions={SORT_OPTIONS}
                hanldeSortOption={(value) => console.log(value)}
                filterOptions={filterOptions}
              />
            )}
            {isFirstLoading && <Loading />}
            {/* TODO: 리스트 연속 로딩 관련 컴포넌트 추가! */}
            {!isFirstLoading && !ratingList && <EmptyView />}
            {ratingList &&
              [...ratingList.map((list) => list.data.ratings)]
                .flat()
                .map((item: RateAPI, idx) => (
                  <List.Rating key={`${item.alcoholId}_${idx}`} data={item} />
                ))}
          </List>
        </section>

        <div ref={targetRef} />

        {!hasNextPage && (
          <LinkButton
            data={{
              korName: '혹시 찾는 술이 없으신가요?',
              engName: 'NO RESULTS',
              icon: true,
              linkSrc: '/search',
            }}
          />
        )}
      </main>
    </NavLayout>
  );
}
