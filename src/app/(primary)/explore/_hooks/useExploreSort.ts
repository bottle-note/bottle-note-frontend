import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_REVIEW_EXPLORE_SORT,
  DEFAULT_WHISKEY_EXPLORE_SORT,
  type ExploreSortPreset,
  type ReviewExploreSortPreset,
  REVIEW_EXPLORE_SORT_PRESETS,
  type WhiskeyExploreSortPreset,
  WHISKEY_EXPLORE_SORT_PRESETS,
} from '../_constants/exploreSorts';
import {
  parseExploreTabId,
  REVIEW_EXPLORE_TAB_ID,
  type ExploreTabId,
  WHISKEY_EXPLORE_TAB_ID,
} from '../_constants/exploreTabs';

interface UseExploreSortOptions {
  tabId: ExploreTabId;
}

interface UseExploreSortResult<TPreset extends ExploreSortPreset> {
  sortPresets: readonly TPreset[];
  selectedSort: TPreset;
  selectSort: (presetId: string) => void;
}

export function useExploreSort(options: {
  tabId: typeof WHISKEY_EXPLORE_TAB_ID;
}): UseExploreSortResult<WhiskeyExploreSortPreset>;
export function useExploreSort(options: {
  tabId: typeof REVIEW_EXPLORE_TAB_ID;
}): UseExploreSortResult<ReviewExploreSortPreset>;
export function useExploreSort({
  tabId,
}: UseExploreSortOptions): UseExploreSortResult<ExploreSortPreset> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceTabId = parseExploreTabId(searchParams.get('tab'));
  const isActiveTab = sourceTabId === tabId;
  const sortPresets: readonly ExploreSortPreset[] =
    tabId === REVIEW_EXPLORE_TAB_ID
      ? REVIEW_EXPLORE_SORT_PRESETS
      : WHISKEY_EXPLORE_SORT_PRESETS;
  const defaultSort: ExploreSortPreset =
    tabId === REVIEW_EXPLORE_TAB_ID
      ? DEFAULT_REVIEW_EXPLORE_SORT
      : DEFAULT_WHISKEY_EXPLORE_SORT;
  const rawSortType = searchParams.get('sortType');
  const rawSortOrder = searchParams.get('sortOrder');
  const requestedSort = useMemo(
    () =>
      isActiveTab
        ? sortPresets.find(
            (preset) =>
              preset.sortType === rawSortType &&
              preset.sortOrder === rawSortOrder,
          )
        : undefined,
    [isActiveTab, rawSortOrder, rawSortType, sortPresets],
  );
  const selectedSort = requestedSort ?? defaultSort;
  const hasSortParams = rawSortType !== null || rawSortOrder !== null;
  const shouldCleanSortParams =
    isActiveTab &&
    hasSortParams &&
    (!requestedSort || requestedSort.id === defaultSort.id);

  useEffect(() => {
    if (!shouldCleanSortParams) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('sortType');
    params.delete('sortOrder');
    const nextQuery = params.toString();
    if (nextQuery === searchParams.toString()) return;

    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [pathname, router, searchParams, shouldCleanSortParams]);

  const selectSort = useCallback(
    (presetId: string) => {
      if (!isActiveTab || presetId === selectedSort.id) return;

      const nextSort = sortPresets.find((preset) => preset.id === presetId);
      if (!nextSort) return;

      const params = new URLSearchParams(searchParams.toString());
      if (nextSort.id === defaultSort.id) {
        params.delete('sortType');
        params.delete('sortOrder');
      } else {
        params.set('sortType', nextSort.sortType);
        params.set('sortOrder', nextSort.sortOrder);
      }

      const nextQuery = params.toString();
      if (nextQuery === searchParams.toString()) return;
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [
      defaultSort.id,
      isActiveTab,
      pathname,
      router,
      searchParams,
      selectedSort.id,
      sortPresets,
    ],
  );

  return {
    sortPresets,
    selectedSort,
    selectSort,
  };
}
