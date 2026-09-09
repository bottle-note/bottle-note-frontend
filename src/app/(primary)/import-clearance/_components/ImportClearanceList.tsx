'use client';

import { useEffect, useMemo, useState } from 'react';
import { isAfter, isBefore, parseISO } from 'date-fns';
import EmptyView from '@/components/ui/Display/EmptyView';
import List from '@/components/feature/List/List';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import ImportClearanceFilter, {
  type ImportClearanceSort,
} from './ImportClearanceFilter';
import ImportClearanceListItem from './ImportClearanceListItem';
import { importClearanceItems } from '../_data/importClearanceItems';

export default function ImportClearanceList() {
  const { isNavigationVisible, setNavbarSuppressed } = useNavLayout();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<ImportClearanceSort>('latest');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const isHeaderCollapsed = isSearchActive || !isNavigationVisible;

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
  };

  return (
    <div className="min-h-safe-screen bg-bg-layer-default text-fg-neutral">
      <div className="fixed-content top-0 z-10 bg-bg-layer-default">
        <AutoHideLogoHeader isVisible={!isHeaderCollapsed} sticky={false} />
      </div>
      <section
        className="w-full pb-navbar"
        style={{ marginTop: 'var(--logo-header-expanded-height)' }}
      >
        <h1
          className={
            isSearchActive ? 'sr-only' : 'px-5 pb-3 pt-5 text-24 font-bold'
          }
        >
          수입통관
        </h1>
        <ImportClearanceFilter
          items={importClearanceItems}
          isSearchActive={isSearchActive}
          onSearchActiveChange={handleSearchActiveChange}
          onKeywordChange={setKeyword}
          sort={sort}
          onSortChange={setSort}
          startDate={startDate}
          endDate={endDate}
          onDateChange={(nextStartDate, nextEndDate) => {
            setStartDate(nextStartDate);
            setEndDate(nextEndDate);
          }}
          onReset={handleReset}
        />
        {filteredItems.length === 0 ? (
          <EmptyView text="조건에 맞는 수입통관 내역이 없어요." />
        ) : (
          <List>
            <List.Section>
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
