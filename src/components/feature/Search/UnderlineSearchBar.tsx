'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useSearchInput } from '@/hooks/useSearchInput';
import { cn } from '@/lib/utils';

export interface UnderlineSearchBarActions {
  searchText: string;
  submit: () => void;
}

export interface UnderlineSearchBarProps {
  onSearch?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  initialValue?: string;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  actionsClassName?: string;
  clearable?: boolean;
  autoFocus?: boolean;
  renderActions?: (actions: UnderlineSearchBarActions) => ReactNode;
}

export default function UnderlineSearchBar({
  onSearch,
  onValueChange,
  onFocusChange,
  initialValue = '',
  value,
  placeholder = '입력...',
  ariaLabel,
  className = '',
  inputClassName = '',
  actionsClassName = '',
  clearable = false,
  autoFocus = false,
  renderActions,
}: UnderlineSearchBarProps) {
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
    value,
  });

  // 포커스 이벤트로 검색 활성 상태를 켜므로, 화면 진입 시 상위 컴포넌트의 상태 초기화가 끝난 다음 프레임에 포커스한다
  useEffect(() => {
    if (!autoFocus) return;

    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, inputRef]);

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
          'w-full appearance-none rounded-none border-b-2 border-stroke-neutral-subtle bg-transparent px-8 py-10 text-base outline-none transition-colors placeholder:text-fg-neutral-muted focus:border-stroke-focus-ring',
          inputClassName,
        )}
        value={value ?? searchText}
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
            'absolute right-0 top-10 flex justify-end gap-7',
            actionsClassName,
          )}
        >
          {clearable && searchText.length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearSearchText}
              className="flex h-24 w-24 items-center justify-center"
              aria-label="검색어 지우기"
            >
              <X aria-hidden className="h-14 w-14 text-fg-neutral-muted" />
            </button>
          )}
          {renderActions?.({ searchText, submit: handleSubmit })}
        </div>
      ) : null}
    </div>
  );
}
