'use client';

import { useState } from 'react';
import Image from 'next/image';
import ArrowDownIcon from 'public/Arrow-Down_Sub_Coral.svg';
import DescendingIcon from 'public/Descending_Sub_Coral.svg';
import OptionDropdown from '../OptionDropdown';

interface Props {
  total: number;
  sortOptions?: string[];
  hanldeSortOption?: (value: string) => void;
  filterOptions?: { id: number; value: string }[];
}

// SORT, ORDER(Ascending, Descending), FILTER,
const ListManager = ({
  total,
  sortOptions,
  filterOptions,
  hanldeSortOption,
}: Props) => {
  const [isOptonShow, setIsOptionShow] = useState(false);
  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };

  return (
    <>
      <article className="flex justify-between items-center text-mainGray text-sm pb-3.25 border-mainBlack border-b">
        <span className="text-xs text-mainGray">{`총 ${total}개`}</span>
        {sortOptions && (
          <div className="flex gap-1.5 ">
            <button>
              <Image src={DescendingIcon} alt="내림차순" />
            </button>
            <button
              className="label-default flex items-center gap-1 px-2.5 py-1 rounded-md text-xxs"
              onClick={handleOptionsShow}
            >
              <span>{sortOptions[0]}</span>
              <Image src={ArrowDownIcon} alt="정렬" />
            </button>

            {filterOptions && (
              <button
                className="label-default flex items-center gap-1 px-2.5 py-1 rounded-md text-xxs"
                onClick={handleOptionsShow}
              >
                <span>{filterOptions[0].value}</span>
                <Image src={ArrowDownIcon} alt="필터" />
              </button>
            )}
          </div>
        )}
      </article>

      {isOptonShow && <OptionDropdown handleClose={handleOptionsShow} />}
    </>
  );
};

export default ListManager;
