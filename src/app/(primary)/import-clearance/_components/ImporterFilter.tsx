'use client';

import { ListFilter } from 'lucide-react';
import StickySearchBar from '@/components/feature/Search/StickySearchBar';

interface Props {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onReset: () => void;
}

export default function ImporterFilter({
  isSearchActive,
  onSearchActiveChange,
  keyword,
  onKeywordChange,
  onReset,
}: Props) {
  return (
    <StickySearchBar
      testId="importer-search-bar"
      containerClassName="-mx-5 px-5 pt-[5px]"
      isSearchActive={isSearchActive}
      onSearchActiveChange={onSearchActiveChange}
      onValueChange={onKeywordChange}
      value={keyword}
      ariaLabel="수입사 검색"
      placeholder="수입사명 검색"
      inputClassName="pr-16"
      clearable
      renderActions={() => (
        <button
          type="button"
          aria-label="필터메뉴"
          disabled
          className="rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring disabled:opacity-40"
          title="필터는 준비 중입니다"
        >
          <ListFilter aria-hidden className="h-5 w-5" />
        </button>
      )}
    />
  );
}
