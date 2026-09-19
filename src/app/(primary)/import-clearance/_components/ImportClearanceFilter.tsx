'use client';

import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';

interface Props {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  onReset: () => void;
}

export default function ImportClearanceFilter({
  isSearchActive,
  onSearchActiveChange,
  keyword,
  onKeywordChange,
  startDate,
  endDate,
  onDateChange,
  onReset,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <StickySearchBar
        testId="import-clearance-search-bar"
        containerClassName="-mx-4 px-4 pt-[5px]"
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        onValueChange={onKeywordChange}
        value={keyword}
        ariaLabel="수입 정보 검색"
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
        <Accordion title="처리일자">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateChange}
            description="처리일자 기준으로 조회할 수 있어요."
          />
        </Accordion>
      </SideFilterDrawer>
    </>
  );
}
