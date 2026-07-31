'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSearchInput } from '@/hooks/useSearchInput';
import { cn } from '@/lib/utils';

interface UnderlineSearchBarActions {
  searchText: string;
  submit: () => void;
}

interface Props {
  onSearch?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  initialValue?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  actionsClassName?: string;
  clearable?: boolean;
  renderActions?: (actions: UnderlineSearchBarActions) => ReactNode;
}

export default function UnderlineSearchBar({
  onSearch,
  onValueChange,
  onFocusChange,
  initialValue = '',
  placeholder = '입력...',
  ariaLabel,
  className = '',
  inputClassName = '',
  actionsClassName = '',
  clearable = false,
  renderActions,
}: Props) {
  const {
    searchText,
    inputRef,
    handleChange,
    handleSubmit,
    handleClear,
    handleFocusChange,
    handleKeyDown,
  } = useSearchInput({
    onSearch,
    onFocusChange,
    initialValue,
  });

  const clearSearchText = () => {
    handleClear();
    onValueChange?.('');
  };

  return (
    <div className={cn('relative w-full text-fg-neutral', className)}>
      <input
        ref={inputRef}
        type="text"
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        className={cn(
          'w-full appearance-none rounded-none border-b-2 border-stroke-neutral-subtle bg-transparent px-2 py-2.5 text-base outline-none transition-colors placeholder:text-fg-neutral-muted focus:border-stroke-focus-ring',
          inputClassName,
        )}
        value={searchText}
        onChange={(event) => {
          const value = event.target.value;
          handleChange(value);
          onValueChange?.(value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => handleFocusChange(true)}
        onBlur={() => handleFocusChange(false)}
      />

      {(clearable && searchText.length > 0) || renderActions ? (
        <div
          className={cn(
            'absolute right-0 top-2.5 flex justify-end gap-[7px]',
            actionsClassName,
          )}
        >
          {clearable && searchText.length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearSearchText}
              className="flex h-6 w-6 items-center justify-center"
              aria-label="검색어 지우기"
            >
              <X aria-hidden className="h-3.5 w-3.5 text-fg-neutral-muted" />
            </button>
          )}
          {renderActions?.({ searchText, submit: handleSubmit })}
        </div>
      ) : null}
    </div>
  );
}
