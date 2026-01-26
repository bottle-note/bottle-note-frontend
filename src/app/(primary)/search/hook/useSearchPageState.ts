import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFilter } from '@/hooks/useFilter';
import { SORT_ORDER, SORT_TYPE } from '@/api/_shared/types';
import { Category } from '@/types/common';
import { safeDecodeURIComponent } from '@/utils/safeDecodeURIComponent';

interface FilterState {
  keyword: string;
  category: Category;
  regionId: string;
  sortType: SORT_TYPE;
  sortOrder: SORT_ORDER;
}

const getDefaultValue = <T>(value: T | null, defaultValue: T): T => {
  return value || defaultValue;
};

export const useSearchPageState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get('category') as Category;
  const rawUrlKeyword = searchParams.get('keyword');
  const urlKeyword = rawUrlKeyword
    ? safeDecodeURIComponent(rawUrlKeyword)
    : null;
  const urlRegionId = searchParams.get('regionId');
  const urlSortType = searchParams.get('sortType') as SORT_TYPE;
  const urlSortOrder = searchParams.get('sortOrder') as SORT_ORDER;

  const isEmptySearch = !searchParams.has('category') && !urlKeyword;

  const initialState: FilterState = {
    category: getDefaultValue(urlCategory, ''),
    keyword: getDefaultValue(urlKeyword, ''),
    regionId: getDefaultValue(urlRegionId, ''),
    sortType: getDefaultValue(urlSortType, SORT_TYPE.POPULAR),
    sortOrder: getDefaultValue(urlSortOrder, SORT_ORDER.DESC),
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

  // URL 파라미터가 변경되면 filterState 동기화
  useEffect(() => {
    const category = getDefaultValue(urlCategory, '');
    const keyword = getDefaultValue(urlKeyword, '');
    const regionId = getDefaultValue(urlRegionId, '');
    const sortType = getDefaultValue(urlSortType, SORT_TYPE.POPULAR);
    const sortOrder = getDefaultValue(urlSortOrder, SORT_ORDER.DESC);

    if (filterState.category !== category) handleFilter('category', category);
    if (filterState.keyword !== keyword) handleFilter('keyword', keyword);
    if (filterState.regionId !== regionId) handleFilter('regionId', regionId);
    if (filterState.sortType !== sortType) handleFilter('sortType', sortType);
    if (filterState.sortOrder !== sortOrder)
      handleFilter('sortOrder', sortOrder);
  }, [urlCategory, urlKeyword, urlRegionId, urlSortType, urlSortOrder]);

  // filterState가 변경되면 URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    const { category, keyword, regionId, sortType, sortOrder } = filterState;

    if (category) params.set('category', category);
    if (keyword) params.set('keyword', keyword);
    if (regionId) params.set('regionId', regionId);
    if (sortType) params.set('sortType', sortType);
    if (sortOrder) params.set('sortOrder', sortOrder);

    const newUrl = `/search?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filterState, router]);

  return {
    filterState,
    handleFilter,
    isEmptySearch,
    urlKeyword,
  };
};
