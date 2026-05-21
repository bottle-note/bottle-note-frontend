import Image from 'next/image';
import type { SearchKeyword } from './ExploreSearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';

interface Props {
  keyword: SearchKeyword;
  onRemove: (keywordValue: string) => void;
  textClassName?: string;
}

export const ExploreKeywordChip = ({
  keyword,
  onRemove,
  textClassName = 'text-13',
}: Props) => {
  return (
    <button
      type="button"
      className={`label-default inline-flex h-7 items-center gap-1 ${textClassName} leading-none`}
      onClick={() => onRemove(keyword.value)}
      aria-label={`${keyword.label} 검색어 지우기`}
    >
      <span className="leading-none">{keyword.label}</span>
      <Image
        src={DeleteIcon}
        alt=""
        aria-hidden
        className="block h-3.5 w-3.5 shrink-0"
      />
    </button>
  );
};
