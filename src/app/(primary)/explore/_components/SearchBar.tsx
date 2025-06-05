import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LucideSearch } from 'lucide-react';
import SideFilterDrawer from '@/components/SideFilterDrawer';
import { Accordion } from '@/components/SideFilterDrawer/Accordion';
import { CATEGORY_MENUS_LIST, REGIONS } from '@/constants/common';
import HelpIcon from 'public/icon/help-filled-subcoral.svg';
import FilterIcon from 'public/icon/filter-subcoral.svg';

interface Props {
  handleSearch: () => void;
  handleAddKeyword: (keyword: string) => void;
  description: string;
}

export const SearchBar = ({
  handleSearch,
  handleAddKeyword,
  description,
}: Props) => {
  const [searchText, setSearchText] = useState('');
  const [isOpenSideFilter, setIsOpenSideFilter] = useState(false);

  const onAddKeyword = (v: string) => {
    handleAddKeyword(v);
    setSearchText('');
  };

  useEffect(() => {
    console.log(CATEGORY_MENUS_LIST);
  }, []);

  return (
    <>
      <article className="w-full relative">
        <input
          type="text"
          placeholder="입력..."
          className="w-full py-2.5 px-2 border-b-2 border-gray-200 focus:border-amber-500 outline-none bg-transparent text-base placeholder-mainGray placeholder:text-13 transition-colors"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
            onClick={handleSearch}
          >
            <LucideSearch className="w-3.5 h-3.5" />
            검색
          </button>
          <button onClick={() => setIsOpenSideFilter(true)}>
            <Image src={FilterIcon} alt="필터메뉴" />
          </button>
        </div>

        <div className="flex items-start gap-[2px] py-[10px]">
          <Image src={HelpIcon} alt="help" className="pt-[1px]" />
          <p className="text-12 text-mainGray whitespace-pre-line">
            {description}
          </p>
        </div>
      </article>

      <SideFilterDrawer
        isOpen={isOpenSideFilter}
        onClose={() => setIsOpenSideFilter(false)}
        resetFilter={() => {}}
      >
        <Accordion title="카테고리">
          <Accordion.Single>
            <Accordion.Content
              title={CATEGORY_MENUS_LIST[0].name}
              value={CATEGORY_MENUS_LIST[0].id}
              isSelected={true}
              onClick={onAddKeyword}
            />
          </Accordion.Single>
          <Accordion.Grid cols={2}>
            {CATEGORY_MENUS_LIST.slice(1, CATEGORY_MENUS_LIST.length).map(
              (v) => (
                <Accordion.Content
                  title={v.name}
                  value={v.id}
                  isSelected={false}
                  onClick={onAddKeyword}
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
              isSelected={true}
              onClick={onAddKeyword}
            />
          </Accordion.Single>
          <Accordion.Grid cols={2}>
            {REGIONS.slice(1, REGIONS.length).map((v) => (
              <Accordion.Content
                title={v.korName}
                value={v.korName}
                isSelected={false}
                onClick={onAddKeyword}
                key={v.regionId}
              />
            ))}
          </Accordion.Grid>
        </Accordion>
      </SideFilterDrawer>
    </>
  );
};
