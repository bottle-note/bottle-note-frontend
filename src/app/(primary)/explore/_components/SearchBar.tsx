import { useState } from 'react';
import Image from 'next/image';
import { LucideSearch } from 'lucide-react';
import HelpIcon from 'public/icon/help-filled-subcoral.svg';

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

  const onAddKeyword = (v: string) => {
    handleAddKeyword(v);
    setSearchText('');
  };

  return (
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
      </div>

      <div className="flex items-start gap-[2px] py-[10px]">
        <Image src={HelpIcon} alt="help" className="pt-[1px]" />
        <p className="text-12 text-mainGray whitespace-pre-line">
          {description}
        </p>
      </div>
    </article>
  );
};
