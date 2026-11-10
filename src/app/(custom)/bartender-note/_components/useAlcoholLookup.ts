import { useEffect, useState } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 300;

export const normalizeLookupQuery = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

/** 술 이름 검색. 입력이 멈추면 검색하고, 목록 끝에 닿으면 다음 페이지를 이어 받는다. */
export function useAlcoholLookup(query: string, enabled = true) {
  const normalizedQuery = normalizeLookupQuery(query);
  const [lookupQuery, setLookupQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(
      () => setLookupQuery(normalizedQuery),
      DEBOUNCE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [normalizedQuery]);

  const lookup = usePaginatedQuery({
    queryKey: ['bartender-note', 'alcohol-lookup', lookupQuery],
    queryFn: ({ pageParam, signal }) =>
      AlcoholsApi.lookupPage({
        keyword: lookupQuery,
        cursor: pageParam,
        size: PAGE_SIZE,
        signal,
      }),
    enabled: enabled && lookupQuery.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const typing = normalizedQuery !== lookupQuery;
  const pages = typing ? undefined : lookup.data;
  const results: AlcoholLookupItem[] = [];
  const seen = new Set<number>();
  pages?.forEach((page) =>
    page.data.items.forEach((item) => {
      if (seen.has(item.alcoholId)) return;
      seen.add(item.alcoholId);
      results.push(item);
    }),
  );
  // 첫 페이지를 받기 전(입력 중 포함)과 이어 받기를 나눈다. 이어 받기 중에는 받은 목록을 그대로 둔다
  const searching = !!normalizedQuery && (typing || (!pages && !lookup.error));
  const firstPageError = !typing && !pages && !!lookup.error;
  const nextPageError = !!pages && !!lookup.error && !lookup.isFetching;

  return {
    normalizedQuery,
    /** 검색 버튼·엔터처럼 기다리지 않고 바로 검색할 때 쓴다. */
    searchNow: (value: string) => setLookupQuery(normalizeLookupQuery(value)),
    results,
    loaded: !!pages,
    searching,
    firstPageError,
    nextPageError,
    isFetchingNextPage: lookup.isFetchingNextPage,
    /** 목록 끝 감지 요소를 둘지. 다음 페이지가 없거나 이어 받기에 실패하면 떼어 더 요청하지 않는다. */
    canLoadMore: !!pages && !!lookup.hasNextPage && !nextPageError,
    targetRef: lookup.targetRef,
    retryFirstPage: () => void lookup.refetch(),
    retryNextPage: () => void lookup.fetchNextPage(),
  };
}
