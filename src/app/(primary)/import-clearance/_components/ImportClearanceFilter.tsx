'use client';

import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';
import { MfdsApi } from '@/api/mfds/mfds.api';
import type { MfdsAlcoholType } from '@/api/mfds/types';
import { ALCOHOL_TYPE_OPTIONS } from '../_lib/declaration';

interface Props {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  exportCountry: string | null;
  onExportCountryChange: (exportCountry: string | null) => void;
  alcoholType: MfdsAlcoholType | null;
  onAlcoholTypeChange: (alcoholType: MfdsAlcoholType | null) => void;
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
  exportCountry,
  onExportCountryChange,
  alcoholType,
  onAlcoholTypeChange,
  onReset,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: countries } = useQuery({
    queryKey: ['mfds.countries'],
    queryFn: async () => (await MfdsApi.getCountries()).data,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

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
        <Accordion title="통관일자">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateChange}
            description="통관일자 기준으로 조회할 수 있어요."
          />
        </Accordion>

        <Accordion title="주종">
          <Accordion.Single>
            <Accordion.Content
              title="전체"
              value="all"
              isSelected={!alcoholType}
              onClick={() => onAlcoholTypeChange(null)}
            />
          </Accordion.Single>
          <Accordion.Grid cols={3}>
            {ALCOHOL_TYPE_OPTIONS.map((option) => (
              <Accordion.Content
                key={option.id}
                title={option.name}
                value={option.id}
                isSelected={alcoholType === option.id}
                onClick={() =>
                  onAlcoholTypeChange(
                    alcoholType === option.id ? null : option.id,
                  )
                }
              />
            ))}
          </Accordion.Grid>
        </Accordion>

        <Accordion title="수출국">
          <Accordion.Single>
            <Accordion.Content
              title="전체"
              value="all"
              isSelected={!exportCountry}
              onClick={() => onExportCountryChange(null)}
            />
          </Accordion.Single>
          <Accordion.Grid cols={3}>
            {(countries ?? []).map((country) => (
              <Accordion.Content
                key={country.alpha2}
                title={country.nameKo ?? country.alpha2}
                value={country.alpha2}
                isSelected={exportCountry === country.alpha2}
                onClick={() =>
                  onExportCountryChange(
                    exportCountry === country.alpha2 ? null : country.alpha2,
                  )
                }
              />
            ))}
          </Accordion.Grid>
        </Accordion>
      </SideFilterDrawer>
    </>
  );
}
