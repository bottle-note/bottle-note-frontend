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
import { SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useFilter } from '@/hooks/useFilter';
import { RateAPI } from '@/types/Rate';

export default function Rating() {
  const router = useRouter();
  const {
    state: filterState,
    setKeyword,
    setCategory,
    setSortOrder,
    setSortType,
    setRegionId,
  } = useFilter();

  const {
    data: ratingList,
    isLoading,
    fetchNextPage,
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
  };

  // TODO: useFilterOptions 로 공통화
  const [filterOptions, setFilterOptions] = useState<
    { id: number; value: string }[] | null
  >(null);

  useEffect(() => {
    setSortOrder(SORT_ORDER.DESC);
    setSortType(SORT_TYPE.RANDOM);
  }, []);

  useEffect(() => {
    (async () => {
      const result = await AlcoholsApi.getRegion();

      setFilterOptions(result);
    })();
  }, []);

  // TODO: useSortOptions 로 공통화
  const SORT_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];

  if (isLoading) return <Loading />;

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

            {!isLoading && !ratingList && <EmptyView />}
            {ratingList &&
              [...ratingList.map((list) => list.data.ratings)]
                .flat()
                .map((item: any) => (
                  <List.Rating key={item.alcoholId} data={item} />
                ))}
          </List>
        </section>

        <button onClick={() => fetchNextPage()}>load more</button>

        <LinkButton
          data={{
            korName: '혹시 찾는 술이 없으신가요?',
            engName: 'NO RESULTS',
            icon: true,
            linkSrc: '/search',
          }}
        />
      </main>
    </NavLayout>
  );
}
