'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format, isValid, parseISO } from 'date-fns';
import List from '@/components/feature/List/List';
import {
  GuestListGate,
  useGuestPagedSession,
} from '@/components/feature/auth/GuestListGate';
import { useTabbedListPageSearch } from '@/components/feature/TabbedListPage/TabbedListPageHeader';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { MfdsApi } from '@/api/mfds/mfds.api';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import ImportClearanceFilter from './ImportClearanceFilter';
import ImportClearanceListItem from './ImportClearanceListItem';

const PAGE_SIZE = 20;
const GUEST_PAGE_SIZE = 12;

export default function ImportClearanceList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSearchActive, onSearchActiveChange } = useTabbedListPageSearch();
  const { isLoggedIn, isGuest, pageSize } = useGuestPagedSession(
    PAGE_SIZE,
    GUEST_PAGE_SIZE,
  );
  const [inputKeyword, setInputKeyword] = useState(() =>
    normalizeKeyword(searchParams.get('keyword') ?? ''),
  );
  const [keyword, setKeyword] = useState(inputKeyword);
  const [startDate, setStartDate] = useState(
    () => parseQueryDateRange(searchParams).startDate,
  );
  const [endDate, setEndDate] = useState(
    () => parseQueryDateRange(searchParams).endDate,
  );
  const [exportCountry, setExportCountry] = useState(() =>
    searchParams.get('country'),
  );
  const [alcoholCategory, setAlcoholCategory] = useState(() =>
    searchParams.get('category'),
  );
  const urlKeyword = normalizeKeyword(searchParams.get('keyword') ?? '');
  const syncedKeywordRef = useRef(urlKeyword);

  const processedDateFrom = startDate ? format(startDate, 'yyyy-MM-dd') : '';
  const processedDateTo = endDate ? format(endDate, 'yyyy-MM-dd') : '';

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const query = params.toString();
      if (query === searchParams.toString()) return;

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const normalizedKeyword = normalizeKeyword(inputKeyword);
    const timer = window.setTimeout(() => {
      setKeyword(normalizedKeyword);
      updateSearchParams({ keyword: normalizedKeyword || null });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [inputKeyword, updateSearchParams]);

  useEffect(() => {
    const keywordFromUrl = urlKeyword;
    const { startDate: startDateFromUrl, endDate: endDateFromUrl } =
      parseQueryDateRange(searchParams);

    if (syncedKeywordRef.current !== keywordFromUrl) {
      syncedKeywordRef.current = keywordFromUrl;
      setInputKeyword(keywordFromUrl);
      setKeyword(keywordFromUrl);
    }
    setStartDate(startDateFromUrl);
    setEndDate(endDateFromUrl);
    setExportCountry(searchParams.get('country'));
    setAlcoholCategory(searchParams.get('category'));
  }, [searchParams, urlKeyword]);

  // 검색어·기간이 바뀌면 queryKey가 바뀌어 첫 페이지부터 다시 조회한다.
  // 커서는 조회 조건에 묶여 서명되므로 조건을 유지한 채로만 이어 쓸 수 있다.
  const {
    data: pages,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    targetRef,
    refetch,
  } = usePaginatedQuery<MfdsAlcoholListItem[]>({
    queryKey: [
      'mfds.alcohols',
      keyword,
      processedDateFrom,
      processedDateTo,
      exportCountry,
      alcoholCategory,
      pageSize,
    ],
    queryFn: ({ pageParam, signal }) =>
      MfdsApi.getAlcohols({
        keyword: keyword || undefined,
        processedDateFrom: processedDateFrom || undefined,
        processedDateTo: processedDateTo || undefined,
        exportCountry: exportCountry || undefined,
        alcoholCategoryKo: alcoholCategory || undefined,
        cursor: pageParam,
        size: pageSize,
        signal,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const items = useMemo(
    () => pages?.flatMap((page) => page.data) ?? [],
    [pages],
  );
  const hasLoadedFirstPage = pages !== undefined;
  const isEmpty = hasLoadedFirstPage && !error && items.length === 0;
  const hasNextPageError = Boolean(error) && items.length > 0;
  const shouldGateGuestList = isGuest && items.length > 0;

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setExportCountry(null);
    setAlcoholCategory(null);
    updateSearchParams({
      startDate: null,
      endDate: null,
      country: null,
      category: null,
    });
  };

  const handleDateChange = (
    nextStartDate: Date | null,
    nextEndDate: Date | null,
  ) => {
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    updateSearchParams({
      startDate: nextStartDate ? format(nextStartDate, 'yyyy-MM-dd') : null,
      endDate: nextEndDate ? format(nextEndDate, 'yyyy-MM-dd') : null,
    });
  };

  const handleExportCountryChange = (nextExportCountry: string | null) => {
    setExportCountry(nextExportCountry);
    updateSearchParams({ country: nextExportCountry });
  };

  const handleAlcoholCategoryChange = (nextAlcoholCategory: string | null) => {
    setAlcoholCategory(nextAlcoholCategory);
    updateSearchParams({ category: nextAlcoholCategory });
  };

  return (
    <div className="min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <section
        className="w-full px-5 pb-navbar"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        <h1 className="sr-only">수입통관</h1>
        <ImportClearanceFilter
          isSearchActive={isSearchActive}
          onSearchActiveChange={onSearchActiveChange}
          keyword={inputKeyword}
          onKeywordChange={setInputKeyword}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          exportCountry={exportCountry}
          onExportCountryChange={handleExportCountryChange}
          alcoholCategory={alcoholCategory}
          onAlcoholCategoryChange={handleAlcoholCategoryChange}
          onReset={handleReset}
        />
        <List
          emptyViewText="조건에 맞는 수입 정보가 없어요."
          isListFirstLoading={isLoading}
          isError={Boolean(error) && items.length === 0}
          isEmpty={isEmpty}
        >
          <List.Section>
            {items.map((item) => (
              <ImportClearanceListItem key={item.id} item={item} />
            ))}
          </List.Section>
        </List>
        {hasNextPageError ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-13 text-fg-neutral-muted">
              목록을 더 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-stroke-neutral-weak px-5 py-2 text-13 text-fg-neutral-muted active:bg-bg-layer-default-pressed"
            >
              다시 시도
            </button>
          </div>
        ) : (
          isLoggedIn && <div ref={targetRef} />
        )}
        {shouldGateGuestList && (
          <GuestListGate
            title="더 많은 수입 정보가 궁금하신가요?"
            description="로그인하고 전체 수입통관 내역을 더 확인해보세요."
          />
        )}
        {isFetchingNextPage && (
          <p className="py-4 text-center text-13 text-fg-neutral-muted">
            불러오는 중…
          </p>
        )}
      </section>
    </div>
  );
}

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

// 공유 링크 등으로 시작일이 종료일보다 늦게 들어오면 서버가 400을 주므로 순서를 바로잡는다.
function parseQueryDateRange(searchParams: URLSearchParams) {
  const startDate = parseQueryDate(searchParams.get('startDate'));
  const endDate = parseQueryDate(searchParams.get('endDate'));

  if (startDate && endDate && startDate > endDate) {
    return { startDate: endDate, endDate: startDate };
  }
  return { startDate, endDate };
}

function parseQueryDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = parseISO(value);
  return isValid(date) ? date : null;
}
