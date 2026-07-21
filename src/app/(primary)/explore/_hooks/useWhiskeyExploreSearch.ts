import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DEBOUNCE_DELAY_MS = 300;

export const normalizeExploreKeyword = (keyword: string) =>
  keyword.trim().replace(/\s+/g, ' ');

export const useWhiskeyExploreSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceTabId = searchParams.get('tab') ?? 'REVIEW_WHISKEY';
  const initialKeyword =
    sourceTabId === 'EXPLORER_WHISKEY'
      ? searchParams.getAll('keywords')[0] ?? ''
      : '';

  const [inputKeyword, setInputKeyword] = useState(initialKeyword);
  const normalizedKeyword = useMemo(
    () => normalizeExploreKeyword(inputKeyword),
    [inputKeyword],
  );
  const [debouncedKeyword, setDebouncedKeyword] = useState(() =>
    normalizeExploreKeyword(initialKeyword),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(normalizedKeyword);
    }, DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [normalizedKeyword]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'EXPLORER_WHISKEY');
    params.delete('keywords');

    if (debouncedKeyword) {
      params.append('keywords', debouncedKeyword);
    }

    const nextQuery = params.toString();
    if (nextQuery === searchParams.toString()) return;

    router.replace(`${pathname}?${nextQuery}`, { scroll: false });
  }, [debouncedKeyword, pathname, router, searchParams]);

  return {
    inputKeyword,
    debouncedKeyword,
    isTyping: normalizedKeyword !== debouncedKeyword,
    setInputKeyword,
  };
};
