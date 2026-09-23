'use client';

import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import DateRangePicker from '@/components/ui/Form/DateRangePicker';
import { MfdsApi } from '@/api/mfds/mfds.api';

// 필터 옵션은 원장 적재 때만 바뀌므로 하루 동안 재조회하지 않는다.
const FILTER_OPTION_QUERY_CACHE = {
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24,
} as const;

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
  alcoholCategory: string | null;
  onAlcoholCategoryChange: (alcoholCategory: string | null) => void;
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
  alcoholCategory,
  onAlcoholCategoryChange,
  onReset,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const countriesQuery = useQuery({
    queryKey: ['mfds.countries'],
    queryFn: async () => (await MfdsApi.getCountries()).data,
    ...FILTER_OPTION_QUERY_CACHE,
  });
  const categoriesQuery = useQuery({
    queryKey: ['mfds.alcohols.category'],
    queryFn: async () => (await MfdsApi.getAlcoholCategories()).data,
    ...FILTER_OPTION_QUERY_CACHE,
  });

  // 옵션 조회가 실패한 채로 남아 있으면 필터를 열 때 다시 요청한다.
  const handleOpen = () => {
    if (countriesQuery.isError) countriesQuery.refetch();
    if (categoriesQuery.isError) categoriesQuery.refetch();
    setIsOpen(true);
  };

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
            onClick={handleOpen}
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
          />
        </Accordion>

        <Accordion title="주종">
          <Accordion.Single>
            <Accordion.Content
              title="전체"
              value="all"
              isSelected={!alcoholCategory}
              onClick={() => onAlcoholCategoryChange(null)}
            />
          </Accordion.Single>
          <Accordion.Grid cols={3}>
            {(categoriesQuery.data ?? []).map(({ alcoholCategoryKo }) =>
              alcoholCategoryKo ? (
                <Accordion.Content
                  key={alcoholCategoryKo}
                  title={alcoholCategoryKo}
                  value={alcoholCategoryKo}
                  isSelected={alcoholCategory === alcoholCategoryKo}
                  onClick={() =>
                    onAlcoholCategoryChange(
                      alcoholCategory === alcoholCategoryKo
                        ? null
                        : alcoholCategoryKo,
                    )
                  }
                />
              ) : null,
            )}
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
            {(countriesQuery.data ?? []).map((country) => (
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
