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
import Layout from '../search/layout';
import { REGIONS } from '@/constants/common';

interface InitialState {
  keyword: string;
  category: Category | '';
  regionId: RegionId;
  sortType: SORT_TYPE.RANDOM;
  sortOrder: SORT_ORDER.DESC;
}

export default function Rating() {
  const router = useRouter();
  const currentCategory = useSearchParams().get('category');

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
    hasNextPage,
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

  const handleCategoryCallback = (value: string) => {
    handleFilter('category', value === 'All' ? '' : value);
    if (value !== currentCategory) router.push(`/rating?category=${value}`);
  };

  const SORT_OPTIONS = [
    { name: '랜덤순', type: SORT_TYPE.RANDOM },
    { name: '인기도순', type: SORT_TYPE.POPULAR },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '찜하기순', type: SORT_TYPE.PICK },
    { name: '댓글순', type: SORT_TYPE.REVIEW },
  ];

  return (
    <Layout>
      <section className="flex flex-col gap-7">
        <CategorySelector handleCategoryCallback={handleCategoryCallback} />

        <List isListFirstLoading={isFirstLoading} isScrollLoading={isFetching}>
          <List.Total total={ratingList ? ratingList[0].data.totalCount : 0} />
          <List.SortOrderToggle
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

          {/* TODO: 리스트 연속 로딩 관련 컴포넌트 추가! */}
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
    </Layout>
  );
}
