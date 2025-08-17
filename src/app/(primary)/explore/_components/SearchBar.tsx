import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { LucideSearch } from 'lucide-react';
import SideFilterDrawer from '@/components/SideFilterDrawer';
import { Accordion } from '@/components/SideFilterDrawer/Accordion';
import { CATEGORY_MENUS_LIST, REGIONS } from '@/constants/common';
import { useSearchInput } from '@/hooks/useSearchInput';
import HelpIcon from 'public/icon/help-filled-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';

interface Props {
  handleSearch: () => void;
  handleAddKeyword: (keyword: string) => void;
  handleRemoveKeyword: (keyword: string) => void;
  description: string;
  isFilter?: boolean;
}

export const SearchBar = ({
  handleSearch,
  handleAddKeyword,
  handleRemoveKeyword,
  description,
  isFilter = false,
}: Props) => {
  const onAddKeyword = (v: string) => {
    if (v.trim()) {
      handleAddKeyword(v.trim());
      handleChange('');
      handleSearch();
    }
  };

  const { searchText, inputRef, handleChange, handleKeyDown } = useSearchInput({
    onSearch: onAddKeyword,
  });

  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Set<(typeof CATEGORY_MENUS_LIST)[number]['name']>
  >(new Set());
  const [selectedRegion, setSelectedRegion] = useState<
    Set<(typeof REGIONS)[number]['korName']>
  >(new Set());

  const handleToggleOption = useMemo(
    () => ({
      category: (value: (typeof CATEGORY_MENUS_LIST)[number]['name']) => {
        setSelectedCategory((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(value)) {
            newSet.delete(value);
            handleRemoveKeyword(value);
          } else {
            newSet.add(value);
            handleAddKeyword(value);
          }
          return newSet;
        });
      },
      region: (value: (typeof REGIONS)[number]['korName']) => {
        setSelectedRegion((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(value)) {
            newSet.delete(value);
            handleRemoveKeyword(value);
          } else {
            newSet.add(value);
            handleAddKeyword(value);
          }
          return newSet;
        });
      },
    }),
    [],
  );

  const handleResetFilter = useCallback(() => {
    setSelectedCategory(new Set());
    setSelectedRegion(new Set());
  }, []);

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
          onKeyDown={(e) => {
            handleKeyDown(e);
            if (e.key === 'Enter' && searchText.trim()) {
              onAddKeyword(searchText);
            }
          }}
        />

        <div className="flex justify-end gap-[7px] absolute top-2.5 right-0">
          <button
            className="label-default text-13 text-nowrap"
            onClick={() => onAddKeyword(searchText)}
          >
            + 추가
          </button>
          <button
            className="label-selected text-13 text-nowrap flex items-center gap-[2px]"
            onClick={() => onAddKeyword(searchText)}
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
          resetFilter={handleResetFilter}
        >
          <Accordion title="카테고리">
            <Accordion.Single>
              <Accordion.Content
                title="전체"
                value={CATEGORY_MENUS_LIST[0].id}
                isSelected={selectedCategory.size === 0}
                onClick={() => setSelectedCategory(new Set())}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {CATEGORY_MENUS_LIST.slice(1, CATEGORY_MENUS_LIST.length).map(
                (v) => (
                  <Accordion.Content
                    title={v.name}
                    value={v.id}
                    isSelected={selectedCategory.has(v.name)}
                    onClick={() => handleToggleOption.category(v.name)}
                    key={v.id}
                  />
                ),
              )}
            </Accordion.Grid>
          </Accordion>

          <Accordion title="지역">
            <Accordion.Single>
              <Accordion.Content
                title="전체"
                value={REGIONS[0].regionId}
                isSelected={selectedRegion.size === 0}
                onClick={() => setSelectedRegion(new Set())}
              />
            </Accordion.Single>
            <Accordion.Grid cols={2}>
              {REGIONS.slice(1, REGIONS.length).map((v) => (
                <Accordion.Content
                  title={v.korName}
                  value={v.korName}
                  isSelected={selectedRegion.has(v.korName)}
                  onClick={() => {
                    handleToggleOption.region(v.korName);
                  }}
                  key={v.regionId}
                />
              ))}
            </Accordion.Grid>
          </Accordion>
        </SideFilterDrawer>
      )}
    </section>
  );
};
