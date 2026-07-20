import { useState } from 'react';
import Image from 'next/image';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import { CATEGORY_MENUS_LIST } from '@/constants/common';
import { useScrollState } from '@/hooks/useScrollState';
import { cn } from '@/lib/utils';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import type { SearchKeyword } from './types';
import HelpIcon from 'public/icon/help-filled-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';
import { useExploreFilters } from '../_hooks/useExploreFilters';

interface BaseProps {
  description: string;
  isFilter?: boolean;
}

interface ChipSearchProps extends BaseProps {
  mode?: 'chip';
  handleSearch: () => void;
  handleAddKeyword: (keyword: SearchKeyword) => void;
}

interface RealtimeSearchProps extends BaseProps {
  mode: 'realtime';
  initialValue: string;
  onValueChange: (value: string) => void;
}

type Props = ChipSearchProps | RealtimeSearchProps;

export const ExploreSearchBar = (props: Props) => {
  const { description, isFilter = false } = props;
  const isRealtime = props.mode === 'realtime';
  const { isVisible } = useScrollState(100);
  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);
  const { regions } = useRegionsQuery();
  const {
    regionIds: selectedRegionIds,
    category: selectedCategory,
    toggleRegionId,
    clearRegionIds,
    toggleCategory,
    clearCategory,
  } = useExploreFilters();

  const onAddKeyword = (rawValue: string) => {
    if (isRealtime) return;

    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return;

    props.handleAddKeyword({
      label: trimmedValue,
      value: trimmedValue,
    });
    props.handleSearch();
  };

  const clearFilterSelections = () => {
    clearCategory();
    clearRegionIds();
  };

  return (
    <section
      data-testid="explore-search-bar"
      className={cn(
        'sticky z-[9] -mx-4 bg-white px-4 pt-[5px]',
        isVisible
          ? 'translate-y-0 transition-transform duration-150 ease-out motion-reduce:transition-none'
          : 'pointer-events-none -translate-y-full transition-none',
      )}
      style={{
        top: 'var(--explore-fixed-header-height)',
      }}
    >
      <article className="relative w-full">
        <UnderlineSearchBar
          onSearch={isRealtime ? undefined : onAddKeyword}
          onValueChange={isRealtime ? props.onValueChange : undefined}
          initialValue={isRealtime ? props.initialValue : undefined}
          inputClassName={isRealtime ? 'pr-16' : 'pr-[140px]'}
          clearable
          renderActions={
            !isRealtime || isFilter
              ? ({ submit }) => (
                  <>
                    {!isRealtime && (
                      <button
                        type="button"
                        className="label-selected text-13 text-nowrap flex items-center gap-[2px]"
                        onClick={submit}
                      >
                        <span>+ 검색어 추가</span>
                      </button>
                    )}
                    {isFilter && (
                      <button
                        type="button"
                        aria-label="필터메뉴"
                        onClick={() => setIsOpenSideFilter(true)}
                      >
                        <Image src={FilterIcon} alt="" />
                      </button>
                    )}
                  </>
                )
              : undefined
          }
        />

        <div className="flex items-start gap-[2px] py-[10px]">
          <Image src={HelpIcon} alt="help" className="pt-[1px]" />
          <p className="text-12 text-mainGray whitespace-pre-line">
            {description}
          </p>
        </div>
      </article>

      {isFilter && (
        <SideFilterDrawer
          isOpen={isOpenSideFilter}
          onClose={() => setIsOpenSideFilter(false)}
          resetFilter={clearFilterSelections}
        >
          <Accordion title="카테고리">
            <Accordion.Single>
              <Accordion.Content
                title="전체"
                value={CATEGORY_MENUS_LIST[0].id}
                isSelected={!selectedCategory}
                onClick={clearCategory}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {CATEGORY_MENUS_LIST.slice(1).map((category) => (
                <Accordion.Content
                  title={category.name}
                  value={category.id}
                  isSelected={selectedCategory === String(category.id)}
                  onClick={() => toggleCategory(String(category.id))}
                  key={category.id}
                />
              ))}
            </Accordion.Grid>
          </Accordion>

          <Accordion title="지역">
            <Accordion.Single>
              <Accordion.Content
                title="전체"
                value={String(regions[0].regionId)}
                isSelected={selectedRegionIds.length === 0}
                onClick={clearRegionIds}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {regions.slice(1).map((region) => (
                <Accordion.Content
                  title={region.korName}
                  value={String(region.regionId)}
                  isSelected={
                    typeof region.regionId === 'number' &&
                    selectedRegionIds.includes(region.regionId)
                  }
                  onClick={() => {
                    if (typeof region.regionId === 'number') {
                      toggleRegionId(region.regionId);
                    }
                  }}
                  key={region.regionId}
                />
              ))}
            </Accordion.Grid>
          </Accordion>
        </SideFilterDrawer>
      )}
    </section>
  );
};
