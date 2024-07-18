'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import LinkButton from '@/components/LinkButton';
import { RateApi } from '@/app/api/RateApi';
import { Category, RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useFilter } from '@/hooks/useFilter';
import { RateAPI } from '@/types/Rate';
import { REGIONS } from '@/constants/common';
import SearchContainer from '../search/_components/SearchContainer';

interface InitialState {
  keyword: string;
  category: Category | '';
  regionId: RegionId;
  sortType: SORT_TYPE.RANDOM;
  sortOrder: SORT_ORDER.DESC;
}

export default function Rating() {
  const router = useRouter();
  const currCategory = useSearchParams().get('category');
  const currSearchKeyword = useSearchParams().get('query');

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
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    ratings: RateAPI[];
    totalCount: number;
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

  const handleSearchCallback = (searchedKeyword: string) => {
    handleFilter('keyword', searchedKeyword);
    router.replace(
      `/rating?category=${currCategory ?? ''}&query=${searchedKeyword ?? ''}`,
    );
  };

  const handleCategoryCallback = (selectedCategory: Category) => {
    handleFilter('category', selectedCategory);
    router.replace(
      `/rating?category=${selectedCategory}&query=${currSearchKeyword ?? ''}`,
    );
  };

  const SORT_OPTIONS = [
    { name: '랜덤순', type: SORT_TYPE.RANDOM },
    { name: '인기도순', type: SORT_TYPE.POPULAR },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '찜하기순', type: SORT_TYPE.PICK },
    { name: '댓글순', type: SORT_TYPE.REVIEW },
  ];

  return (
    <main className="mb-24 w-full h-full">
      <SearchContainer handleSearchCallback={handleSearchCallback} />
      <section className="flex flex-col gap-7  p-5">
        <CategorySelector handleCategoryCallback={handleCategoryCallback} />

        <List isListFirstLoading={isFirstLoading} isScrollLoading={isFetching}>
          <List.Total total={ratingList ? ratingList[0].data.totalCount : 0} />
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

          {ratingList &&
            [...ratingList.map((list) => list.data.ratings)]
              .flat()
              .map((item: RateAPI, idx) => (
                <List.Rating key={`${item.alcoholId}_${idx}`} data={item} />
              ))}
        </List>

        <div ref={targetRef} />

        <LinkButton
          data={{
            korName: '혹시 찾는 술이 없으신가요?',
            engName: 'NO RESULTS',
            icon: true,
            linkSrc: '/search',
          }}
        />
      </section>
    </main>
  );
}
