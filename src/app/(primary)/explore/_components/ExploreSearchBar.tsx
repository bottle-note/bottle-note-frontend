import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';
import { CATEGORY_MENUS_LIST } from '@/constants/common';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import type { ExploreSortPreset } from '../_constants/exploreSorts';
import { EXPLORE_RATING_PRESETS } from '../_constants/exploreFilters';
import { useExploreFilters } from '../_hooks/useExploreFilters';

interface Props {
  mode: 'realtime';
  description: string;
  filterTarget: 'whiskey' | 'review';
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  initialValue: string;
  onValueChange: (value: string) => void;
  sortPresets?: readonly ExploreSortPreset[];
  selectedSortId?: string;
  onSelectSort?: (presetId: string) => void;
}

export const ExploreSearchBar = ({
  description,
  filterTarget,
  isSearchActive,
  onSearchActiveChange,
  initialValue,
  onValueChange,
  sortPresets = [],
  selectedSortId,
  onSelectSort,
}: Props) => {
  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);
  const { regions } = useRegionsQuery();
  const {
    regionIds: selectedRegionIds,
    category: selectedCategory,
    ratingPreset: selectedRatingPreset,
    toggleRegionId,
    clearRegionIds,
    toggleCategory,
    clearCategory,
    selectRatingPreset,
    clearRating,
    clearWhiskeyFilters,
    clearReviewFilters,
  } = useExploreFilters();

  const clearFilterSelections = () => {
    if (filterTarget === 'whiskey') {
      clearWhiskeyFilters();
      return;
    }

    clearReviewFilters();
  };

  return (
    <>
      <StickySearchBar
        testId="explore-search-bar"
        containerClassName="-mx-4 px-4 pt-[5px]"
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        description={description}
        onValueChange={onValueChange}
        initialValue={initialValue}
        ariaLabel={filterTarget === 'review' ? '리뷰 검색' : '위스키 검색'}
        inputClassName="pr-16"
        clearable
        renderActions={() => (
          <button
            type="button"
            aria-label="필터메뉴"
            className="rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            onClick={() => setIsOpenSideFilter(true)}
          >
            <ListFilter aria-hidden className="h-5 w-5" />
          </button>
        )}
      />

      <SideFilterDrawer
        isOpen={isOpenSideFilter}
        onClose={() => setIsOpenSideFilter(false)}
        resetFilter={clearFilterSelections}
      >
        {sortPresets.length > 0 && selectedSortId && onSelectSort && (
          <Accordion title="정렬">
            <Accordion.Grid cols={2}>
              {sortPresets.map((preset) => (
                <Accordion.Content
                  title={preset.label}
                  value={preset.id}
                  isSelected={selectedSortId === preset.id}
                  onClick={onSelectSort}
                  key={preset.id}
                />
              ))}
            </Accordion.Grid>
          </Accordion>
        )}

        {filterTarget === 'whiskey' && (
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
        )}

        {filterTarget === 'whiskey' && (
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
        )}

        <Accordion title="별점">
          <Accordion.Single>
            <Accordion.Content
              title="별점 전체"
              value="all"
              isSelected={selectedRatingPreset === undefined}
              onClick={clearRating}
            />
          </Accordion.Single>
          <Accordion.Grid cols={2}>
            {EXPLORE_RATING_PRESETS.map((preset) => (
              <Accordion.Content
                title={preset.label}
                value={preset.id}
                isSelected={selectedRatingPreset?.id === preset.id}
                onClick={() => selectRatingPreset(preset.id)}
                key={preset.id}
              />
            ))}
          </Accordion.Grid>
        </Accordion>
      </SideFilterDrawer>
    </>
  );
};
