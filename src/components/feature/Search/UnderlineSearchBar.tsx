'use client';

import type { ReactNode } from 'react';
import { useSearchInput } from '@/hooks/useSearchInput';
import { cn } from '@/lib/utils';

interface UnderlineSearchBarActions {
  searchText: string;
  submit: () => void;
}

interface Props {
  onSearch?: (value: string) => void;
  onValueChange?: (value: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  actionsClassName?: string;
  renderActions?: (actions: UnderlineSearchBarActions) => ReactNode;
}

export default function UnderlineSearchBar({
  onSearch,
  onValueChange,
  initialValue = '',
  placeholder = '입력...',
  className = '',
  inputClassName = '',
  actionsClassName = '',
  renderActions,
}: Props) {
  const { searchText, inputRef, handleChange, handleSubmit, handleKeyDown } =
    useSearchInput({
      onSearch,
      initialValue,
    });

  return (
    <div className={cn('relative w-full', className)}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={cn(
          'w-full appearance-none rounded-none border-b-2 border-gray-200 bg-transparent px-2 py-2.5 text-base outline-none transition-colors placeholder-mainGray placeholder:text-13 focus:border-amber-500',
          inputClassName,
        )}
        value={searchText}
        onChange={(event) => {
          const value = event.target.value;
          handleChange(value);
          onValueChange?.(value);
        }}
        onKeyDown={handleKeyDown}
      />

      {renderActions && (
        <div
          className={cn(
            'absolute right-0 top-2.5 flex justify-end gap-[7px]',
            actionsClassName,
          )}
        >
          {renderActions({ searchText, submit: handleSubmit })}
        </div>
      )}
    </div>
  );
}
