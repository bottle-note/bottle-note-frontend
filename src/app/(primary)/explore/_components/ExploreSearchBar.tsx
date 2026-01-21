import { useState } from 'react';
import Image from 'next/image';
import { LucideSearch } from 'lucide-react';
import SideFilterDrawer from '@/components/feature/SideFilterDrawer';
import { Accordion } from '@/components/feature/SideFilterDrawer/Accordion';
import { CATEGORY_MENUS_LIST, REGIONS } from '@/constants/common';
import { useSearchInput } from '@/hooks/useSearchInput';
import HelpIcon from 'public/icon/help-filled-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';

export interface SearchKeyword {
  label: string;
  value: string;
}

interface Props {
  handleSearch: () => void;
  handleAddKeyword: (keyword: SearchKeyword) => void;
  handleRemoveKeyword: (keywordValue: string) => void;
  description: string;
  isFilter?: boolean;
  activeKeywords?: SearchKeyword[];
}

export const ExploreSearchBar = ({
  handleSearch,
  handleAddKeyword,
  handleRemoveKeyword,
  description,
  isFilter = false,
}: Props) => {
  const onAddKeyword = (rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return;

    handleAddKeyword({
      label: trimmedValue,
      value: trimmedValue,
    });
    handleSearch();
  };

  const { searchText, inputRef, handleChange, handleSubmit, handleKeyDown } =
    useSearchInput({
      onSearch: onAddKeyword,
    });

  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Set<string>>(
    new Set(),
  );
  const [selectedRegion, setSelectedRegion] = useState<
    Set<(typeof REGIONS)[number]['korName']>
  >(new Set());

  const clearCategorySelections = () => {
    if (selectedCategory.size === 0) return;

    selectedCategory.forEach((categoryValue) => {
      handleRemoveKeyword(categoryValue);
    });
    setSelectedCategory(new Set());
  };

  const clearRegionSelections = () => {
    if (selectedRegion.size === 0) return;

    selectedRegion.forEach((regionValue) => {
      handleRemoveKeyword(regionValue);
    });
    setSelectedRegion(new Set());
  };

  const clearFilterSelections = () => {
    clearCategorySelections();
    clearRegionSelections();
  };

  const toggleCategoryFilterSelection = (
    categoryOption: (typeof CATEGORY_MENUS_LIST)[number],
  ) => {
    const categoryValue = String(categoryOption.id ?? '');

    if (!categoryValue) {
      clearCategorySelections();
      return;
    }

    setSelectedCategory((prev) => {
      const nextSelection = new Set(prev);

      if (nextSelection.has(categoryValue)) {
        nextSelection.delete(categoryValue);
        handleRemoveKeyword(categoryValue);
      } else {
        nextSelection.add(categoryValue);
        handleAddKeyword({
          label: categoryOption.name,
          value: categoryValue,
        });
      }

      return nextSelection;
    });
  };

  const toggleRegionFilterSelection = (
    regionOption: (typeof REGIONS)[number],
  ) => {
    const regionValue = regionOption.korName;

    if (!regionOption.regionId) {
      clearRegionSelections();
      return;
    }

    setSelectedRegion((prev) => {
      const nextSelection = new Set(prev);

      if (nextSelection.has(regionValue)) {
        nextSelection.delete(regionValue);
        handleRemoveKeyword(regionValue);
      } else {
        nextSelection.add(regionValue);
        handleAddKeyword({
          label: regionOption.korName,
          value: regionValue,
        });
      }

      return nextSelection;
    });
  };

  return (
    <section className="pt-[5px]">
      <article className="w-full relative ">
        <input
          ref={inputRef}
          type="text"
          placeholder="입력..."
          className="w-full py-2.5 px-2 border-b-2 border-gray-200 focus:border-amber-500 outline-none bg-transparent text-base placeholder-mainGray placeholder:text-13 transition-colors appearance-none rounded-none"
          value={searchText}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex justify-end gap-[7px] absolute top-2.5 right-0">
          <button
            className="label-default text-13 text-nowrap"
            onClick={handleSubmit}
          >
            + 추가
          </button>
          <button
            className="label-selected text-13 text-nowrap flex items-center gap-[2px]"
            onClick={handleSubmit}
          >
            <LucideSearch className="w-3.5 h-3.5" />
            검색
          </button>
          {isFilter && (
            <button onClick={() => setIsOpenSideFilter(true)}>
              <Image src={FilterIcon} alt="필터메뉴" />
            </button>
          )}
        </div>

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
                isSelected={selectedCategory.size === 0}
                onClick={clearCategorySelections}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {CATEGORY_MENUS_LIST.slice(1).map((category) => (
                <Accordion.Content
                  title={category.name}
                  value={category.id}
                  isSelected={selectedCategory.has(String(category.id))}
                  onClick={() => toggleCategoryFilterSelection(category)}
                  key={category.id}
                />
              ))}
            </Accordion.Grid>
          </Accordion>

          <Accordion title="지역">
            <Accordion.Single>
              <Accordion.Content
                title="전체"
                value={REGIONS[0].regionId}
                isSelected={selectedRegion.size === 0}
                onClick={clearRegionSelections}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {REGIONS.slice(1).map((region) => (
                <Accordion.Content
                  title={region.korName}
                  value={region.korName}
                  isSelected={selectedRegion.has(region.korName)}
                  onClick={() => toggleRegionFilterSelection(region)}
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
