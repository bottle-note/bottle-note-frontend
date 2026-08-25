import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  isExploreRating,
  type ExploreRating,
} from '../_constants/exploreFilters';

/**
 * explore 페이지 sidebar 필터 (regionIds, category, rating) URL 동기화 훅.
 * 검색어와 정렬은 각각의 전용 훅이 관리하며, 모든 훅은 같은 URL을
 * 공유하면서 서로의 파라미터를 보존한다.
 */
export const useExploreFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const regionIds = useMemo(
    () =>
      searchParams
        .getAll('regionIds')
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n)),
    [searchParams],
  );

  const category = searchParams.get('category') ?? '';
  const rating = useMemo(() => {
    const rawRating = searchParams.get('rating');
    if (!rawRating) return undefined;

    const parsedRating = Number(rawRating);
    return isExploreRating(parsedRating) ? parsedRating : undefined;
  }, [searchParams]);

  const updateUrl = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const nextQuery = params.toString();
      if (nextQuery === searchParams.toString()) return;
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const toggleRegionId = useCallback(
    (id: number) => {
      updateUrl((params) => {
        const idStr = String(id);
        const current = params.getAll('regionIds');
        params.delete('regionIds');
        const next = current.includes(idStr)
          ? current.filter((v) => v !== idStr)
          : [...current, idStr];
        next.forEach((v) => params.append('regionIds', v));
      });
    },
    [updateUrl],
  );

  const clearRegionIds = useCallback(() => {
    updateUrl((params) => params.delete('regionIds'));
  }, [updateUrl]);

  const toggleCategory = useCallback(
    (value: string) => {
      updateUrl((params) => {
        if (params.get('category') === value) {
          params.delete('category');
        } else {
          params.set('category', value);
        }
      });
    },
    [updateUrl],
  );

  const clearCategory = useCallback(() => {
    updateUrl((params) => params.delete('category'));
  }, [updateUrl]);

  const selectRating = useCallback(
    (value: ExploreRating) => {
      updateUrl((params) => params.set('rating', String(value)));
    },
    [updateUrl],
  );

  const clearRating = useCallback(() => {
    updateUrl((params) => params.delete('rating'));
  }, [updateUrl]);

  const clearWhiskeyFilters = useCallback(() => {
    updateUrl((params) => {
      params.delete('regionIds');
      params.delete('category');
      params.delete('rating');
      params.delete('sortType');
      params.delete('sortOrder');
    });
  }, [updateUrl]);

  const clearReviewFilters = useCallback(() => {
    updateUrl((params) => {
      params.delete('rating');
      params.delete('sortType');
      params.delete('sortOrder');
    });
  }, [updateUrl]);

  return {
    regionIds,
    category,
    rating,
    toggleRegionId,
    clearRegionIds,
    toggleCategory,
    clearCategory,
    selectRating,
    clearRating,
    clearWhiskeyFilters,
    clearReviewFilters,
  };
};
