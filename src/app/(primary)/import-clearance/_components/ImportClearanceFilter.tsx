'use client';

import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import { max, min, parseISO } from 'date-fns';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';
import type { ImportClearanceItem } from './ImportClearanceListItem';

export type ImportClearanceSort = 'latest' | 'oldest';

interface Props {
  items: ImportClearanceItem[];
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  onKeywordChange: (keyword: string) => void;
  sort: ImportClearanceSort;
  onSortChange: (sort: ImportClearanceSort) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  onReset: () => void;
}

export default function ImportClearanceFilter({
  items,
  isSearchActive,
  onSearchActiveChange,
  onKeywordChange,
  sort,
  onSortChange,
  startDate,
  endDate,
  onDateChange,
  onReset,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dates = items.map((item) => parseISO(item.clearanceDate));
  const minDate = min(dates);
  const maxDate = max(dates);

  return (
    <>
      <StickySearchBar
        testId="import-clearance-search-bar"
        containerClassName="px-5 pt-[5px]"
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        onValueChange={onKeywordChange}
        ariaLabel="수입통관 검색"
        placeholder="품목명, 수입사 검색"
        inputClassName="pr-16"
        clearable
        renderActions={() => (
          <button
            type="button"
            aria-label="필터메뉴"
            className="rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsOpen(true)}
          >
            <ListFilter aria-hidden className="h-5 w-5" />
          </button>
        )}
      />

      <SideFilterDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        resetFilter={onReset}
      >
        <Accordion title="정렬">
          <Accordion.Grid cols={2}>
            <Accordion.Content
              title="최신 통관일순"
              value="latest"
              isSelected={sort === 'latest'}
              onClick={() => onSortChange('latest')}
            />
            <Accordion.Content
              title="오래된 통관일순"
              value="oldest"
              isSelected={sort === 'oldest'}
              onClick={() => onSortChange('oldest')}
            />
          </Accordion.Grid>
        </Accordion>
        <Accordion title="통관일">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateChange}
            minDate={minDate}
            maxDate={maxDate}
            description="통관일 기준으로 조회할 수 있어요."
          />
        </Accordion>
      </SideFilterDrawer>
    </>
  );
}
