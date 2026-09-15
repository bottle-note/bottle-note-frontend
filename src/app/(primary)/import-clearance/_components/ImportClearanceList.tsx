'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import EmptyView from '@/components/ui/Display/EmptyView';
import List from '@/components/feature/List/List';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import ImportClearanceFilter, {
  type ImportClearanceSort,
} from './ImportClearanceFilter';
import ImportClearanceListItem from './ImportClearanceListItem';
import { importClearanceItems } from '../_data/importClearanceItems';

const tabList = [{ id: 'clearance', name: '수입통관' }];

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
  const [sort, setSort] = useState<ImportClearanceSort>(() =>
    searchParams.get('sort') === 'oldest' ? 'oldest' : 'latest',
  );
  const [startDate, setStartDate] = useState(() =>
    parseQueryDate(searchParams.get('startDate')),
  );
  const [endDate, setEndDate] = useState(() =>
    parseQueryDate(searchParams.get('endDate')),
  );
  const urlKeyword = normalizeKeyword(searchParams.get('keyword') ?? '');
  const syncedKeywordRef = useRef(urlKeyword);
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;

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
    const sortFromUrl =
      searchParams.get('sort') === 'oldest' ? 'oldest' : 'latest';
    const startDateFromUrl = parseQueryDate(searchParams.get('startDate'));
    const endDateFromUrl = parseQueryDate(searchParams.get('endDate'));

    if (syncedKeywordRef.current !== keywordFromUrl) {
      syncedKeywordRef.current = keywordFromUrl;
      setInputKeyword(keywordFromUrl);
      setKeyword(keywordFromUrl);
    }
    setSort(sortFromUrl);
    setStartDate(startDateFromUrl);
    setEndDate(endDateFromUrl);
  }, [searchParams, urlKeyword]);

  useEffect(
    () => () => {
      setNavbarSuppressed(false);
    },
    [setNavbarSuppressed],
  );

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return importClearanceItems
      .filter((item) => {
        const date = parseISO(item.clearanceDate);
        const isMatchingKeyword =
          !normalizedKeyword ||
          [item.korName, item.engName, item.importerName].some((value) =>
            value.toLowerCase().includes(normalizedKeyword),
          );
        const isAfterStart = !startDate || !isBefore(date, startDate);
        const isBeforeEnd = !endDate || !isAfter(date, endDate);

        return isMatchingKeyword && isAfterStart && isBeforeEnd;
      })
      .sort((a, b) => {
        const result = a.clearanceDate.localeCompare(b.clearanceDate);
        return sort === 'latest' ? -result : result;
      });
  }, [endDate, keyword, sort, startDate]);

  const handleSearchActiveChange = (active: boolean) => {
    setIsSearchActive(active);
    setNavbarSuppressed(active);
  };

  const handleReset = () => {
    setSort('latest');
    setStartDate(null);
    setEndDate(null);
    updateSearchParams({ sort: null, startDate: null, endDate: null });
  };

  const handleSortChange = (nextSort: ImportClearanceSort) => {
    setSort(nextSort);
    updateSearchParams({ sort: nextSort === 'latest' ? null : nextSort });
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
        className="w-full pb-navbar"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        <h1 className="sr-only">수입통관</h1>
        <ImportClearanceFilter
          items={importClearanceItems}
          isSearchActive={isSearchActive}
          onSearchActiveChange={handleSearchActiveChange}
          keyword={inputKeyword}
          onKeywordChange={setInputKeyword}
          sort={sort}
          onSortChange={handleSortChange}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          onReset={handleReset}
        />
        {filteredItems.length === 0 ? (
          <EmptyView text="조건에 맞는 수입통관 내역이 없어요." />
        ) : (
          <List>
            <List.Section className="px-4">
              {filteredItems.map((item) => (
                <ImportClearanceListItem key={item.id} item={item} />
              ))}
            </List.Section>
          </List>
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
