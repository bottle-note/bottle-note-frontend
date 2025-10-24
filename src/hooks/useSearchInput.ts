import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseSearchInputOptions {
  onSearch?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  initialValue?: string;
  syncWithUrlParams?: boolean;
}

export const useSearchInput = ({
  onSearch,
  onFocusChange,
  initialValue = '',
  syncWithUrlParams = false,
}: UseSearchInputOptions = {}) => {
  const searchParams = useSearchParams();
  const urlQuery = syncWithUrlParams ? searchParams.get('query') : null;
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchText, setSearchText] = useState<string>(
    urlQuery ?? initialValue,
  );
  const [isFocused, setIsFocused] = useState(false);

  // URL 파라미터와 동기화
  useEffect(() => {
    if (syncWithUrlParams && urlQuery !== null) {
      setSearchText(urlQuery);
    }
  }, [urlQuery, syncWithUrlParams]);

  // 검색 실행 (엔터 또는 버튼 클릭)
  const handleSubmit = useCallback(() => {
    onSearch?.(searchText);
    inputRef.current?.blur(); // input 포커스 해제
    setIsFocused(false);
    onFocusChange?.(false);
  }, [searchText, onSearch, onFocusChange]);

  // 입력값 변경
  const handleChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // 입력값 초기화
  const handleClear = useCallback(() => {
    setSearchText('');
    inputRef.current?.focus(); // 초기화 후 다시 포커스
    setIsFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);

  // 외부에서 검색 텍스트 설정 (기존 setUpdateSearchText 로직 지원용)
  const handleSetText = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // 포커스 상태 변경
  const handleFocusChange = useCallback(
    (focused: boolean) => {
      setIsFocused(focused);
      onFocusChange?.(focused);
    },
    [onFocusChange],
  );

  // 키보드 이벤트 처리 (엔터 키로 검색 실행 + 포커스 아웃)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return {
    searchText,
    isFocused,
    inputRef,
    handleChange,
    handleSubmit,
    handleClear,
    handleFocusChange,
    handleKeyDown,
    handleSetText,
  };
};
