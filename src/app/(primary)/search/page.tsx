'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import List from '@/components/List/List';
import { usePopularList } from '@/hooks/usePopularList';
import { Category, RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useFilter } from '@/hooks/useFilter';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { AlcoholAPI } from '@/types/Alcohol';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { REGIONS } from '@/constants/common';
import SearchContainer from './_components/SearchContainer';

interface InitialState {
  keyword: string;
  category: Category;
  regionId: RegionId;
  sortType: SORT_TYPE;
  sortOrder: SORT_ORDER;
}

export default function Search() {
  const router = useRouter();
  const { popularList } = usePopularList();

  const currCategory = useSearchParams().get('category');
  const currSearchKeyword = useSearchParams().get('query');

  const initialState: InitialState = {
    keyword: '',
    category: '',
    regionId: '',
    sortType: SORT_TYPE.POPULAR,
    sortOrder: SORT_ORDER.DESC,
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    alcohols: AlcoholAPI[];
    totalCount: number;
  }>({
    queryKey: ['rating', filterState],
    queryFn: ({ pageParam }) => {
      return AlcoholsApi.getList({
        ...filterState,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
  });

  const handleSearchCallback = (searchedKeyword: string) => {
    handleFilter('keyword', searchedKeyword);
    router.replace(
      `/search?category=${currCategory ?? ''}&query=${searchedKeyword ?? ''}`,
    );
  };

  const handleCategoryCallback = (selectedCategory: Category) => {
    handleFilter('category', selectedCategory);
    router.replace(
      `/search?category=${selectedCategory}&query=${currSearchKeyword ?? ''}`,
    );
  };

  const SORT_OPTIONS = [
    { name: '인기도순', type: SORT_TYPE.POPULAR },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '찜하기순', type: SORT_TYPE.PICK },
    { name: '댓글순', type: SORT_TYPE.REVIEW },
  ];

  return (
    <Suspense>
      <main className="mb-24 w-full h-full">
        <SearchContainer
          handleSearchCallback={handleSearchCallback}
          styleProps="px-5 py-10 bg-subCoral"
        />

        <section className="flex flex-col gap-7 p-5">
          <CategorySelector handleCategoryCallback={handleCategoryCallback} />

          {currCategory === null && currSearchKeyword === null ? (
            <section>
              <CategoryTitle subTitle="위클리 HOT 5" />

              <List>
                {popularList.map((item: AlcoholAPI) => (
                  <List.Item
                    key={item.alcoholId}
                    data={{
                      ...item,
                    }}
                  />
                ))}
              </List>
            </section>
          ) : (
            <>
              <List
                isListFirstLoading={isFirstLoading}
                isScrollLoading={isFetching}
              >
                <List.Total
                  total={alcoholList ? alcoholList[0].data.totalCount : 0}
                />
                <List.SortOrderSwitch
                  type={filterState.sortOrder}
                  handleSortOrder={(value) => handleFilter('sortOrder', value)}
                />
                <List.OptionSelect
                  options={SORT_OPTIONS}
                  handleOptionCallback={(value) =>
                    handleFilter('sortType', value)
                  }
                />
                <List.OptionSelect
                  options={REGIONS.map((region) => ({
                    type: String(region.regionId),
                    name: region.korName,
                  }))}
                  handleOptionCallback={(value) =>
                    handleFilter('regionId', value)
                  }
                  title="국가"
                />

                {alcoholList &&
                  [...alcoholList.map((list) => list.data.alcohols)]
                    .flat()
                    .map((item: AlcoholAPI, idx) => (
                      <List.Item key={`${item.alcoholId}_${idx}`} data={item} />
                    ))}
              </List>
              <div ref={targetRef} />
            </>
          )}
        </section>
      </main>
    </Suspense>
  );
}
