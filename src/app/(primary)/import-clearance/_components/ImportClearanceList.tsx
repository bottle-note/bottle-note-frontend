'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, isValid, parseISO } from 'date-fns';
import List from '@/components/feature/List/List';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { MfdsApi } from '@/api/mfds/mfds.api';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import ImportClearanceFilter from './ImportClearanceFilter';
import ImportClearanceListItem from './ImportClearanceListItem';

const tabList = [{ id: 'clearance', name: '수입통관' }];
const PAGE_SIZE = 20;

export default function ImportClearanceList() {
  const { currentTab, handleTab, refs, registerTab } = useTab({ tabList });
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isNavigationVisible, setNavbarSuppressed } = useNavLayout();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputKeyword, setInputKeyword] = useState(() =>
    normalizeKeyword(searchParams.get('keyword') ?? ''),
  );
  const [keyword, setKeyword] = useState(inputKeyword);
  const [startDate, setStartDate] = useState(() =>
    parseQueryDate(searchParams.get('startDate')),
  );
  const [endDate, setEndDate] = useState(() =>
    parseQueryDate(searchParams.get('endDate')),
  );
  const urlKeyword = normalizeKeyword(searchParams.get('keyword') ?? '');
  const syncedKeywordRef = useRef(urlKeyword);
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;

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
    const startDateFromUrl = parseQueryDate(searchParams.get('startDate'));
    const endDateFromUrl = parseQueryDate(searchParams.get('endDate'));

    if (syncedKeywordRef.current !== keywordFromUrl) {
      syncedKeywordRef.current = keywordFromUrl;
      setInputKeyword(keywordFromUrl);
      setKeyword(keywordFromUrl);
    }
    setStartDate(startDateFromUrl);
    setEndDate(endDateFromUrl);
  }, [searchParams, urlKeyword]);

  useEffect(
    () => () => {
      setNavbarSuppressed(false);
    },
    [setNavbarSuppressed],
  );

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
      PAGE_SIZE,
    ],
    queryFn: ({ pageParam, signal }) =>
      MfdsApi.getAlcohols({
        keyword: keyword || undefined,
        processedDateFrom: processedDateFrom || undefined,
        processedDateTo: processedDateTo || undefined,
        cursor: pageParam,
        size: PAGE_SIZE,
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

  const handleSearchActiveChange = (active: boolean) => {
    setIsSearchActive(active);
    setNavbarSuppressed(active);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    updateSearchParams({ startDate: null, endDate: null });
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

  return (
    <div className="min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <div className="fixed-content top-0 z-10 bg-bg-layer-default">
        <AutoHideLogoHeader isVisible={!isHeaderCollapsed} sticky={false} />
        <div
          className="scroll-navigation-motion absolute inset-x-0 top-[var(--header-height-with-safe)] transition-transform"
          style={{
            transform: isHeaderCollapsed
              ? 'translateY(0)'
              : 'translateY(var(--logo-header-slide-distance))',
          }}
        >
          <Tab
            variant="bookmark"
            tabList={tabList}
            currentTab={currentTab}
            handleTab={handleTab}
            scrollContainerRef={refs.scrollContainerRef}
            registerTab={registerTab}
          />
        </div>
      </div>
      <section
        className="w-full px-4 pb-navbar"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        <h1 className="sr-only">수입통관</h1>
        <ImportClearanceFilter
          isSearchActive={isSearchActive}
          onSearchActiveChange={handleSearchActiveChange}
          keyword={inputKeyword}
          onKeywordChange={setInputKeyword}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
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
          <div ref={targetRef} />
        )}
        {isFetchingNextPage && (
          <p className="py-4 text-center text-13 text-fg-neutral-muted">
            불러오는 중…
          </p>
        )}
        {hasNextPage === false && items.length > 0 && !isFetching && (
          <p className="pb-6 pt-4 text-center text-11 text-fg-neutral-muted">
            식약처 수입 원장에서 수집·정제한 정보예요.
          </p>
        )}
      </section>
    </div>
  );
}

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function parseQueryDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = parseISO(value);
  return isValid(date) ? date : null;
}
