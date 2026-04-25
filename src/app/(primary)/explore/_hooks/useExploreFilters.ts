import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * explore 페이지 sidebar 필터 (regionIds, category) URL 동기화 훅.
 * keywords는 useExploreKeywords가 별도로 관리하며, 두 훅은 같은 URL을
 * 공유하지만 서로의 파라미터는 보존한다.
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
        .filter((n) => Number.isFinite(n) && n > 0),
    [searchParams],
  );

  const category = searchParams.get('category') ?? '';

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

  return {
    regionIds,
    category,
    toggleRegionId,
    clearRegionIds,
    toggleCategory,
    clearCategory,
  };
};
