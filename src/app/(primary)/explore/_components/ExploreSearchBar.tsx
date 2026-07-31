import { useState } from 'react';
import { CircleHelp, ListFilter } from 'lucide-react';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import { useNavLayout } from '@/components/ui/Layout/NavLayout';
import { CATEGORY_MENUS_LIST } from '@/constants/common';
import { cn } from '@/lib/utils';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import type { SearchKeyword } from './types';
import { useExploreFilters } from '../_hooks/useExploreFilters';

interface BaseProps {
  description: string;
  isFilter?: boolean;
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
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
  const { isScrollVisible } = useNavLayout();
  const isSearchActive = props.isSearchActive;
  const shouldShowSearchBar = isSearchActive || isScrollVisible;
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
        'sticky z-[9] -mx-4 bg-bg-layer-default px-4 pt-[5px] text-fg-neutral',
        shouldShowSearchBar
          ? 'pointer-events-auto translate-y-0 transition-[top,transform] duration-150 ease-out motion-reduce:transition-none'
          : 'pointer-events-none -translate-y-full transition-[top,transform] [transition-duration:120ms] ease-in motion-reduce:transition-none',
      )}
      style={{
        top: 'var(--explore-current-header-height)',
      }}
    >
      <article className="relative w-full">
        <UnderlineSearchBar
          onSearch={isRealtime ? undefined : onAddKeyword}
          onValueChange={isRealtime ? props.onValueChange : undefined}
          onFocusChange={props.onSearchActiveChange}
          initialValue={isRealtime ? props.initialValue : undefined}
          ariaLabel={isRealtime ? '위스키 검색' : '검색어 입력'}
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
                        className="rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
                        onClick={() => setIsOpenSideFilter(true)}
                      >
                        <ListFilter aria-hidden className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )
              : undefined
          }
        />

        <div className="flex items-start gap-[2px] py-[10px]">
          <CircleHelp
            aria-hidden
            className="mt-[1px] h-3.5 w-3.5 shrink-0 text-fg-brand"
          />
          <p className="whitespace-pre-line text-12 text-fg-neutral-muted">
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
