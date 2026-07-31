'use client';

import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { CircleX, Search } from 'lucide-react';
import { useSearchInput } from '@/hooks/useSearchInput';

interface Props {
  handleSearch?: (value: string) => void;
  handleFocus?: (status: boolean) => void;
  placeholder?: string;
  setUpdateSearchText?: Dispatch<
    SetStateAction<((text: string) => void) | null>
  >;
  readOnly?: boolean;
  value?: string;
  onDelete?: () => void;
  initialValue?: string;
}

const SearchButton = () => (
  <div className="px-2 w-10 absolute top-0 right-1 h-full flex items-center justify-center">
    <Search aria-hidden className="h-4 w-4 text-fg-brand" />
  </div>
);

export default function SearchBar({
  handleSearch,
  handleFocus,
  placeholder = '어떤 술을 찾고 계신가요?',
  setUpdateSearchText,
  readOnly = false,
  value,
  onDelete,
  initialValue,
}: Props) {
  const {
    searchText,
    inputRef,
    handleChange,
    handleSubmit,
    handleClear,
    handleFocusChange,
    handleKeyDown,
    handleSetText,
  } = useSearchInput({
    onSearch: handleSearch,
    onFocusChange: handleFocus,
    syncWithUrlParams: true,
    initialValue,
  });

  const displayValue = value !== undefined ? value : searchText;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDelete) {
      onDelete();
    } else {
      handleClear();
    }
  };

  const inputProps = {
    type: 'text',
    className:
      'h-10 w-full rounded-lg border border-stroke-brand-solid bg-bg-layer-floating pl-4 pr-12 text-15 text-fg-neutral placeholder:text-fg-neutral-muted focus-visible:ring-2 focus-visible:ring-stroke-focus-ring',
    placeholder,
    'aria-label': '검색어 입력',
  };

  useEffect(() => {
    if (setUpdateSearchText) {
      setUpdateSearchText(() => (newText: string) => {
        handleSetText(newText);
      });
      return () => setUpdateSearchText(null);
    }
  }, [setUpdateSearchText, handleSetText]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        {...inputProps}
        value={displayValue}
        onChange={(e) => !readOnly && handleChange(e.target.value)}
        onKeyDown={readOnly ? undefined : handleKeyDown}
        onFocus={() => !readOnly && handleFocusChange(true)}
        onBlur={() => !readOnly && handleFocusChange(false)}
        readOnly={readOnly}
      />
      {displayValue?.length > 0 && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
          aria-label="검색어 지우기"
        >
          <CircleX aria-hidden className="h-4 w-4 text-fg-neutral-muted" />
        </button>
      )}
      <button
        type="button"
        className="px-2 w-10 absolute top-0 right-1 h-full flex items-center justify-center"
        onClick={handleSubmit}
        aria-label="검색"
      >
        <SearchButton />
      </button>
    </div>
  );
}
